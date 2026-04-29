import { NextResponse } from "next/server";

import { generateMaterialList } from "@/lib/ai/service";
import { getJobContextForApi } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const { jobId, confirmOverwrite = false } = await request.json();
    const context = await getJobContextForApi(jobId);
    const materialList = await generateMaterialList(context);

    if (!context.demo && context.supabase) {
      const { count } = await context.supabase
        .from("material_items")
        .select("*", { count: "exact", head: true })
        .eq("job_id", context.job.id)
        .eq("user_id", context.userId);

      if ((count ?? 0) > 0 && !confirmOverwrite) {
        return NextResponse.json({
          requiresConfirmation: true,
          data: materialList
        });
      }

      await context.supabase
        .from("material_items")
        .delete()
        .eq("job_id", context.job.id)
        .eq("user_id", context.userId);

      await context.supabase.from("material_items").insert(
        materialList.items.map((item) => ({
          job_id: context.job.id,
          user_id: context.userId,
          material_name: item.material_name,
          quantity: item.quantity,
          unit: item.unit,
          supplier: item.supplier ?? null,
          estimated_cost: item.estimated_cost,
          notes: item.notes ?? null
        }))
      );
    }

    return NextResponse.json({ data: materialList });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate materials" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 400 }
    );
  }
}
