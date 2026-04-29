import { redirect } from "next/navigation";

import {
  demoFiles,
  demoJobs,
  demoProfile,
  getDemoJobBundle,
  getDemoStats
} from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  DashboardStats,
  Job,
  JobBundle,
  JobFile,
  Profile,
  SimilarJob
} from "@/lib/types";
import { tokenize } from "@/lib/utils";

export async function getCurrentProfile(): Promise<Profile> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return demoProfile;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile) return profile;

  const fallback: Profile = {
    ...demoProfile,
    id: user.id,
    email: user.email ?? "",
    company_name: null,
    created_at: new Date().toISOString()
  };

  return fallback;
}

export async function getDashboardData(): Promise<{
  profile: Profile;
  stats: DashboardStats;
  recentJobs: Job[];
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      profile: demoProfile,
      stats: getDemoStats(),
      recentJobs: demoJobs
    };
  }

  const profile = await getCurrentProfile();

  const { data: jobs = [] } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", profile.id)
    .order("updated_at", { ascending: false });

  const typedJobs = jobs ?? [];

  return {
    profile,
    stats: {
      totalJobs: typedJobs.length,
      draftEstimates: typedJobs.filter((job) => job.status === "Estimating").length,
      proposalsSent: typedJobs.filter((job) => job.status === "Proposal Sent").length,
      completedJobs: typedJobs.filter((job) => job.status === "Completed").length
    },
    recentJobs: typedJobs.slice(0, 6)
  };
}

export async function getJobs(search?: string): Promise<Job[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    const query = search?.toLowerCase().trim();
    if (!query) return demoJobs;
    return demoJobs.filter((job) =>
      [job.job_name, job.client_name, job.job_type, job.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }

  const profile = await getCurrentProfile();
  let query = supabase
    .from("jobs")
    .select("*")
    .eq("user_id", profile.id)
    .order("updated_at", { ascending: false });

  if (search) {
    query = query.or(
      `job_name.ilike.%${search}%,client_name.ilike.%${search}%,job_type.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getJobBundle(id: string): Promise<JobBundle | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return getDemoJobBundle(id);

  const profile = await getCurrentProfile();

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("user_id", profile.id)
    .single();

  if (error || !job) return null;

  const [
    filesResult,
    analysisResult,
    estimateResult,
    proposalResult,
    materialsResult,
    crewResult,
    completedResult
  ] = await Promise.all([
    supabase.from("job_files").select("*").eq("job_id", id).eq("user_id", profile.id),
    supabase
      .from("ai_analyses")
      .select("*")
      .eq("job_id", id)
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("estimate_line_items")
      .select("*")
      .eq("job_id", id)
      .eq("user_id", profile.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("proposals")
      .select("*")
      .eq("job_id", id)
      .eq("user_id", profile.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("material_items")
      .select("*")
      .eq("job_id", id)
      .eq("user_id", profile.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("crew_instructions")
      .select("*")
      .eq("job_id", id)
      .eq("user_id", profile.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("jobs")
      .select("*")
      .eq("user_id", profile.id)
      .eq("status", "Completed")
      .neq("id", id)
  ]);

  return {
    job,
    files: filesResult.data ?? [],
    analysis: analysisResult.data ?? null,
    estimateLineItems: estimateResult.data ?? [],
    proposal: proposalResult.data ?? null,
    materialItems: materialsResult.data ?? [],
    crewInstruction: crewResult.data ?? null,
    similarJobs: scoreSimilarJobs(job, completedResult.data ?? [])
  };
}

export async function getJobContextForApi(jobId: string): Promise<{
  demo: boolean;
  userId: string;
  profile: Profile;
  job: Job;
  files: JobFile[];
  completedJobs: Job[];
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
}> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const bundle = getDemoJobBundle(jobId);
    if (!bundle) throw new Error("Demo job not found");
    return {
      demo: true,
      userId: demoProfile.id,
      profile: demoProfile,
      job: bundle.job,
      files: bundle.files,
      completedJobs: demoJobs.filter((job) => job.status === "Completed"),
      supabase: null
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", user.id)
    .single();

  if (!job) throw new Error("Job not found");

  const [{ data: files }, { data: completedJobs }] = await Promise.all([
    supabase.from("job_files").select("*").eq("job_id", jobId).eq("user_id", user.id),
    supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "Completed")
      .neq("id", jobId)
  ]);

  return {
    demo: false,
    userId: user.id,
    profile:
      profile ??
      ({
        ...demoProfile,
        id: user.id,
        email: user.email ?? "",
        created_at: new Date().toISOString()
      } satisfies Profile),
    job,
    files: files ?? [],
    completedJobs: completedJobs ?? [],
    supabase
  };
}

export function scoreSimilarJobs(currentJob: Job, completedJobs: Job[]): SimilarJob[] {
  const currentTokens = new Set(
    tokenize(
      [
        currentJob.job_type,
        currentJob.client_notes,
        currentJob.site_visit_notes,
        currentJob.measurements,
        currentJob.lessons_learned
      ]
        .filter(Boolean)
        .join(" ")
    )
  );

  return completedJobs
    .map((job) => {
      const tokens = tokenize(
        [
          job.job_type,
          job.client_notes,
          job.site_visit_notes,
          job.measurements,
          job.lessons_learned,
          job.issues_encountered
        ]
          .filter(Boolean)
          .join(" ")
      );
      const overlap = tokens.filter((token) => currentTokens.has(token)).length;
      const typeBoost = job.job_type === currentJob.job_type ? 12 : 0;
      const score = Math.min(1, (overlap + typeBoost) / 30);
      return {
        id: job.id,
        job_name: job.job_name,
        job_type: job.job_type,
        final_price: job.final_value,
        actual_labour_hours: job.actual_labour_hours,
        profit_margin: job.profit_margin,
        lessons_learned: job.lessons_learned,
        issues_encountered: job.issues_encountered ?? null,
        similarity_reason:
          job.job_type === currentJob.job_type
            ? "Same project type with overlapping notes, measurements, or risks."
            : "Overlapping site notes, risk language, or production details.",
        score
      } satisfies SimilarJob;
    })
    .filter((job) => job.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}
