"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { JobStatus, JobType } from "@/lib/types";
import { parseNumber } from "@/lib/utils";

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

export async function createJobAction(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/jobs/demo-1");

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/jobs/demo-1");

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      user_id: user.id,
      job_name: String(formData.get("job_name") ?? "Untitled job"),
      client_name: String(formData.get("client_name") ?? "Unknown client"),
      client_email: value(formData, "client_email"),
      client_phone: value(formData, "client_phone"),
      property_address: value(formData, "property_address"),
      job_type: String(formData.get("job_type") ?? "Custom") as JobType,
      status: "Lead" as JobStatus,
      budget_range: value(formData, "budget_range"),
      desired_timeline: value(formData, "desired_timeline"),
      client_notes: value(formData, "client_notes"),
      site_visit_notes: value(formData, "site_visit_notes"),
      measurements: value(formData, "measurements"),
      estimated_value: parseNumber(formData.get("estimated_value"), 0)
    })
    .select("*")
    .single();

  if (error || !job) {
    redirect(`/jobs/new?error=${encodeURIComponent(error?.message ?? "Unable to save job")}`);
  }

  await uploadFilesForJob(supabase, user.id, job.id, formData);

  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  redirect(`/jobs/${job.id}`);
}

export async function uploadJobFilesAction(jobId: string, formData: FormData) {
  if (!isSupabaseConfigured) redirect(`/jobs/${jobId}`);

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(`/jobs/${jobId}`);

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await uploadFilesForJob(supabase, user.id, jobId, formData);

  revalidatePath(`/jobs/${jobId}`);
  redirect(`/jobs/${jobId}`);
}

async function uploadFilesForJob(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  userId: string,
  jobId: string,
  formData: FormData
) {
  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);

  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${userId}/${jobId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("job-files")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) continue;

    const {
      data: { publicUrl }
    } = supabase.storage.from("job-files").getPublicUrl(path);

    await supabase.from("job_files").insert({
      job_id: jobId,
      user_id: userId,
      file_name: file.name,
      file_url: publicUrl,
      file_type: file.type,
      extracted_text:
        file.type.startsWith("text/") || file.name.endsWith(".csv")
          ? await file.text()
          : null
    });
  }
}
