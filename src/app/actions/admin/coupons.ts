"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { couponSchema, type CouponInput } from "@/lib/validations/admin/coupon";

interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

function toRow(input: CouponInput) {
  return {
    code: input.code,
    discount_type: input.discountType,
    value: input.value,
    usage_limit: input.usageLimit ? Number(input.usageLimit) : null,
    expires_at: input.expiresAt ? new Date(input.expiresAt).toISOString() : null,
  };
}

export async function createCoupon(input: CouponInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("coupons")
    .insert(toRow(parsed.data))
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/coupons");
  return { success: true, id: data.id };
}

export async function updateCoupon(id: string, input: CouponInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const { error } = await supabase.from("coupons").update(toRow(parsed.data)).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/coupons");
  return { success: true, id };
}

export async function deleteCoupon(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/coupons");
  return { success: true };
}
