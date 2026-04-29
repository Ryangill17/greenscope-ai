import { NextResponse } from "next/server";

import { generateProposal } from "@/lib/ai/service";
import { getJobContextForApi } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const {
      jobId,
      estimateTotal = 0,
      confirmOverwrite = false
    } = await request.json();
    const context = await getJobContextForApi(jobId);
    const proposal = await generateProposal(context, Number(estimateTotal));

    if (!context.demo && context.supabase) {
      const { data: existing } = await context.supabase
        .from("proposals")
        .select("id")
        .eq("job_id", context.job.id)
        .eq("user_id", context.userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing && !confirmOverwrite) {
        return NextResponse.json({
          requiresConfirmation: true,
          data: proposal
        });
      }

      if (existing) {
        await context.supabase
          .from("proposals")
          .update({
            title: proposal.title,
            content: proposal.content,
            price: proposal.price,
            status: "Draft",
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id)
          .eq("user_id", context.userId);
      } else {
        await context.supabase.from("proposals").insert({
          job_id: context.job.id,
          user_id: context.userId,
          title: proposal.title,
          content: proposal.content,
          price: proposal.price,
          status: "Draft"
        });
      }
    }

    return NextResponse.json({ data: proposal });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate proposal" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 400 }
    );
  }
}
