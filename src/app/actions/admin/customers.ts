"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateCustomerNotes(customerId: string, notes: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ admin_notes: notes, updated_at: new Date().toISOString() })
    .eq("id", customerId);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/customers/${customerId}`);
  return { success: true };
}
