import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getAdminCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, sort_order")
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function getAdminCategoryById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
