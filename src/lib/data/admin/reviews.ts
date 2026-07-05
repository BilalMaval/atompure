import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getAdminReviews(status?: string) {
  const supabase = createClient();
  let query = supabase
    .from("reviews")
    .select("id, rating, body, status, is_verified_purchase, created_at, product:products(name, slug)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
