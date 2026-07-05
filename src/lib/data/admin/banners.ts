import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getAdminBanners() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("homepage_banners")
    .select("*, product:products(name, slug), category:categories(name, slug)")
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function getAdminBannerById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("homepage_banners")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
