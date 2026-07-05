"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { isMissingColumnError } from "@/lib/supabase/errors";
import { storeSettingsSchema, type StoreSettingsInput } from "@/lib/validations/admin/settings";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateStoreSettings(input: StoreSettingsInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = storeSettingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const { error } = await supabase
    .from("store_settings")
    .update({
      store_name: parsed.data.storeName,
      support_email: parsed.data.supportEmail || null,
      support_phone: parsed.data.supportPhone || null,
      ga_measurement_id: parsed.data.gaMeasurementId || null,
      flat_shipping_rate: parsed.data.flatShippingRate,
      free_shipping_threshold: parsed.data.freeShippingThreshold,
      tax_rate_percent: parsed.data.taxRatePercent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) {
    // free_shipping_threshold column may not exist yet (migration 0022 not
    // run) — retry without it so the rest of settings still save.
    if (isMissingColumnError(error)) {
      const retry = await supabase
        .from("store_settings")
        .update({
          store_name: parsed.data.storeName,
          support_email: parsed.data.supportEmail || null,
          support_phone: parsed.data.supportPhone || null,
          ga_measurement_id: parsed.data.gaMeasurementId || null,
          flat_shipping_rate: parsed.data.flatShippingRate,
          tax_rate_percent: parsed.data.taxRatePercent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", true);
      if (retry.error) return { success: false, error: retry.error.message };
      revalidatePath("/admin/settings");
      return { success: true };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/settings");
  return { success: true };
}
