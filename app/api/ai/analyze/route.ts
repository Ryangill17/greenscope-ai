import { NextResponse } from "next/server";

import { analyzeJob } from "@/lib/ai/service";
import { getJobContextForApi } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();
    const context = await getJobContextForApi(jobId);
    const analysis = await analyzeJob(context);

    if (!context.demo && context.supabase) {
      await context.supabase.from("ai_analyses").insert({
        job_id: context.job.id,
        user_id: context.userId,
        project_summary: analysis.project_summary,
        missing_information: analysis.missing_information,
        risks: analysis.risks,
        suggested_questions: analysis.suggested_questions,
        upsells: analysis.upsells,
        complexity_rating: analysis.complexity_rating,
        recommended_next_step: analysis.recommended_next_step,
        raw_json: analysis
      });
    }

    return NextResponse.json({ data: analysis });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to analyze job" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 400 }
    );
  }
}
