import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getAllProductsBasic() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, product_images(url, sort_order)")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getFeaturedProductIdsAdmin(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("homepage_featured_products")
    .select("product_id")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((row) => row.product_id);
}

export async function getAllCategoriesBasic() {
  const supabase = createClient();
  const { data, error } = await supabase.from("categories").select("id, name").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getFeaturedCategoryIdsAdmin(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("homepage_featured_categories")
    .select("category_id")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((row) => row.category_id);
}

export interface ResultImageAdmin {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_active: boolean;
}

export async function getResultsGalleryAdmin(): Promise<ResultImageAdmin[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("results_gallery")
    .select("id, image_url, alt_text, sort_order, is_active")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}
