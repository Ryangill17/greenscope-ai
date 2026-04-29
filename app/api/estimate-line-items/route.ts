import { NextResponse } from "next/server";
import { z } from "zod";

import { estimateItemSchema } from "@/lib/ai/schemas";
import { calculateLineTotal } from "@/lib/ai/service";
import { getJobContextForApi } from "@/lib/data";

const saveEstimateSchema = z.object({
  jobId: z.string(),
  items: z.array(estimateItemSchema)
});

export async function POST(request: Request) {
  try {
    const parsed = saveEstimateSchema.parse(await request.json());
    const context = await getJobContextForApi(parsed.jobId);
    const items = parsed.items.map((item) => ({
      ...item,
      total: calculateLineTotal(item)
    }));

    if (!context.demo && context.supabase) {
      await context.supabase
        .from("estimate_line_items")
        .delete()
        .eq("job_id", context.job.id)
        .eq("user_id", context.userId);

      if (items.length) {
        await context.supabase.from("estimate_line_items").insert(
          items.map((item) => ({
            job_id: context.job.id,
            user_id: context.userId,
            category: item.category,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unit_cost: item.unit_cost,
            labour_hours: item.labour_hours,
            labour_rate: item.labour_rate,
            markup_percentage: item.markup_percentage,
            total: item.total
          }))
        );
      }
    }

    return NextResponse.json({ data: { items } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save estimate" },
      { status: 400 }
    );
  }
}
