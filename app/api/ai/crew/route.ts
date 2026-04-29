import { NextResponse } from "next/server";

import { generateCrewInstructions } from "@/lib/ai/service";
import { getJobContextForApi } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const { jobId, confirmOverwrite = false } = await request.json();
    const context = await getJobContextForApi(jobId);
    const instructions = await generateCrewInstructions(context);

    if (!context.demo && context.supabase) {
      const { data: existing } = await context.supabase
        .from("crew_instructions")
        .select("id")
        .eq("job_id", context.job.id)
        .eq("user_id", context.userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing && !confirmOverwrite) {
        return NextResponse.json({
          requiresConfirmation: true,
          data: instructions
        });
      }

      if (existing) {
        await context.supabase
          .from("crew_instructions")
          .update({
            content: instructions.content,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id)
          .eq("user_id", context.userId);
      } else {
        await context.supabase.from("crew_instructions").insert({
          job_id: context.job.id,
          user_id: context.userId,
          content: instructions.content
        });
      }
    }

    return NextResponse.json({ data: instructions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate crew instructions" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 400 }
    );
  }
}
