"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AITone } from "@/lib/types";
import { parseNumber } from "@/lib/utils";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateSettingsAction(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/settings?saved=demo");

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/settings?saved=demo");

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const logo = formData
    .getAll("logo")
    .find((file): file is File => file instanceof File && file.size > 0);

  let companyLogoUrl = text(formData, "existing_logo_url") || null;

  if (logo) {
    const safeName = logo.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${user.id}/company/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("job-files").upload(path, logo, {
      upsert: true
    });
    if (!error) {
      const {
        data: { publicUrl }
      } = supabase.storage.from("job-files").getPublicUrl(path);
      companyLogoUrl = publicUrl;
    }
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email ?? "",
    company_name: text(formData, "company_name"),
    company_logo_url: companyLogoUrl,
    phone: text(formData, "phone"),
    address: text(formData, "address"),
    default_labour_rate: parseNumber(formData.get("default_labour_rate"), 0),
    default_markup: parseNumber(formData.get("default_markup"), 0),
    tax_rate: parseNumber(formData.get("tax_rate"), 0),
    proposal_terms: text(formData, "proposal_terms"),
    preferred_suppliers: text(formData, "preferred_suppliers"),
    service_area: text(formData, "service_area"),
    ai_tone: text(formData, "ai_tone") as AITone
  });

  revalidatePath("/settings");
  redirect("/settings?saved=true");
}
