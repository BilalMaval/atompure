import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isMissingColumnError, isMissingTableError } from "@/lib/supabase/errors";

export interface AdminProductListRow {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  is_active: boolean;
  sort_order: number;
  category: { name: string } | null;
  product_images: { url: string; sort_order: number }[];
  product_variants: { stock_quantity: number }[];
}

export async function getAdminProducts(): Promise<AdminProductListRow[]> {
  const supabase = createClient();

  function buildQuery(withSortOrder: boolean) {
    if (withSortOrder) {
      return supabase
        .from("products")
        .select(
          "id, name, slug, base_price, is_active, sort_order, category:categories(name), product_images(url, sort_order), product_variants(stock_quantity)"
        )
        .order("sort_order", { ascending: true });
    }
    return supabase
      .from("products")
      .select(
        "id, name, slug, base_price, is_active, category:categories(name), product_images(url, sort_order), product_variants(stock_quantity)"
      )
      .order("created_at", { ascending: false });
  }

  const { data, error } = await buildQuery(true);
  if (isMissingColumnError(error)) {
    const fallback = await buildQuery(false);
    if (fallback.error) throw fallback.error;
    return ((fallback.data ?? []) as unknown[]).map((row) => ({
      ...(row as object),
      sort_order: 0,
    })) as unknown as AdminProductListRow[];
  }
  if (error) throw error;
  return (data ?? []) as unknown as AdminProductListRow[];
}

export async function getAdminProductById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*, product_variant_values(value_id)), product_images(*)")
    .eq("id", id)
    .maybeSingle();

  if (isMissingTableError(error)) {
    // migration 0023 (variation groups) not run yet — fall back without it.
    const fallback = await supabase
      .from("products")
      .select("*, product_variants(*), product_images(*)")
      .eq("id", id)
      .maybeSingle();
    if (fallback.error) throw fallback.error;
    return fallback.data;
  }
  if (error) throw error;
  return data;
}
