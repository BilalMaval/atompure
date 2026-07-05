import { createClient } from "@/lib/supabase/server";
import { pickDefaultVariant, type ProductListItem } from "@/lib/data/products";

// These three reads are wrapped in try/catch and fall back to an empty
// list on error. That covers the window before migration 0014 has been
// run against the live project (tables don't exist yet) — without this,
// one failed query here would 500 the entire homepage via Promise.all.
export async function getFeaturedHomepageProducts(): Promise<ProductListItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("homepage_featured_products")
      .select(
        "sort_order, product:products!inner(id, name, slug, base_price, sale_price, is_active, hover_image_url, delivery_charge, free_delivery_min_price, free_home_delivery, product_variants(id, name, price, stock_quantity, is_default_variant), category:categories(name, slug), product_images(id, url, alt_text, sort_order))"
      )
      .eq("product.is_active", true)
      .order("sort_order");

    if (error) throw error;
    return (
      (data ?? []) as unknown as {
        product: ProductListItem & {
          product_variants?: { id: string; name: string; price: number; stock_quantity: number; is_default_variant?: boolean }[];
        };
      }[]
    ).map(({ product }) => {
      const { product_variants, ...rest } = product;
      return { ...rest, quick_add_variant: pickDefaultVariant(product_variants ?? null) };
    });
  } catch {
    return [];
  }
}

export interface FeaturedCategory {
  id: string;
  name: string;
  slug: string;
}

export async function getFeaturedHomepageCategories(): Promise<FeaturedCategory[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("homepage_featured_categories")
      .select("sort_order, category:categories(id, name, slug)")
      .order("sort_order");

    if (error) throw error;
    return (data ?? []).map((row) => row.category) as unknown as FeaturedCategory[];
  } catch {
    return [];
  }
}

export interface ResultImage {
  id: string;
  image_url: string;
  alt_text: string | null;
}

export async function getActiveResultsGallery(): Promise<ResultImage[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("results_gallery")
      .select("id, image_url, alt_text")
      .eq("is_active", true)
      .order("sort_order");

    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}
