import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getAdminCoupons() {
  const supabase = createClient();
  const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAdminCouponById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("coupons").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
