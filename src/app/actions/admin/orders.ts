"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateOrderStatus(
  orderId: string,
  status: (typeof ORDER_STATUSES)[number]
): Promise<ActionResult> {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) return { success: false, error: "Invalid status" };

  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: (typeof PAYMENT_STATUSES)[number]
): Promise<ActionResult> {
  await requireAdmin();
  if (!PAYMENT_STATUSES.includes(paymentStatus)) return { success: false, error: "Invalid status" };

  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}
