import { NextResponse } from "next/server";

import { calculateLineTotal, generateEstimate } from "@/lib/ai/service";
import { getJobContextForApi } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const { jobId, confirmOverwrite = false } = await request.json();
    const context = await getJobContextForApi(jobId);
    const estimate = await generateEstimate(context);
    const items = estimate.items.map((item) => ({
      ...item,
      total: calculateLineTotal(item)
    }));

    if (!context.demo && context.supabase) {
      const { count } = await context.supabase
        .from("estimate_line_items")
        .select("*", { count: "exact", head: true })
        .eq("job_id", context.job.id)
        .eq("user_id", context.userId);

      if ((count ?? 0) > 0 && !confirmOverwrite) {
        return NextResponse.json({
          requiresConfirmation: true,
          data: { ...estimate, items }
        });
      }

      await context.supabase
        .from("estimate_line_items")
        .delete()
        .eq("job_id", context.job.id)
        .eq("user_id", context.userId);

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

    return NextResponse.json({ data: { ...estimate, items } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate estimate" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 400 }
    );
  }
}
