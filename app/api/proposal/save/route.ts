import { NextResponse } from "next/server";
import { z } from "zod";

import { getJobContextForApi } from "@/lib/data";

const saveProposalSchema = z.object({
  jobId: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  status: z.string().default("Draft")
});

export async function POST(request: Request) {
  try {
    const parsed = saveProposalSchema.parse(await request.json());
    const context = await getJobContextForApi(parsed.jobId);

    if (!context.demo && context.supabase) {
      const { data: existing } = await context.supabase
        .from("proposals")
        .select("id")
        .eq("job_id", context.job.id)
        .eq("user_id", context.userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        await context.supabase
          .from("proposals")
          .update({
            title: parsed.title,
            content: parsed.content,
            price: parsed.price,
            status: parsed.status,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id)
          .eq("user_id", context.userId);
      } else {
        await context.supabase.from("proposals").insert({
          job_id: context.job.id,
          user_id: context.userId,
          title: parsed.title,
          content: parsed.content,
          price: parsed.price,
          status: parsed.status
        });
      }
    }

    return NextResponse.json({ data: parsed });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save proposal" },
      { status: 400 }
    );
  }
}
