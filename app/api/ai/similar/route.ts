import { NextResponse } from "next/server";

import { findSimilarJobs } from "@/lib/ai/service";
import { getJobContextForApi } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();
    const context = await getJobContextForApi(jobId);
    const jobs = findSimilarJobs(context.job, context.completedJobs);
    return NextResponse.json({ data: { jobs } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to find similar jobs" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 400 }
    );
  }
}
