import { createClient } from "@/lib/supabase/server";
import { isMissingColumnError, isMissingTableError } from "@/lib/supabase/errors";

export interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  value_ids?: string[];
}

export interface VariationGroupOption {
  id: string;
  name: string;
  layout: "horizontal" | "vertical";
  values: { id: string; value: string }[];
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price: number | null;
  category: { name: string; slug: string } | null;
  product_images: ProductImage[];
  hover_image_url: string | null;
  // The variant a "quick add" from the listing card should use — the
  // product's own default ("Standard") variant when one exists, else its
  // first real variant. Null if the product has no purchasable variant yet.
  quick_add_variant: { id: string; name: string; price: number; stock_quantity: number } | null;
  delivery_charge: number | null;
  free_delivery_min_price: number | null;
  free_home_delivery: boolean;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  benefits: string | null;
  how_to_use: string | null;
  before_after_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  category_id: string | null;
  variant_option_label: string;
  variation_groups: VariationGroupOption[];
  product_variants: ProductVariant[];
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

type SortOption = "name" | "price-asc" | "price-desc";

const NEW_LIST_DEFAULTS = {
  hover_image_url: null,
  sale_price: null,
  quick_add_variant: null,
  delivery_charge: null,
  free_delivery_min_price: null,
  free_home_delivery: false,
};
const NEW_DETAIL_DEFAULTS = {
  hover_image_url: null,
  sale_price: null,
  quick_add_variant: null,
  delivery_charge: null,
  free_delivery_min_price: null,
  free_home_delivery: false,
  variant_option_label: "Size",
  variation_groups: [] as VariationGroupOption[],
};

// Reusable variation groups (migration 0023) assigned to one product, in
// that product's own display order, each with its values in their own
// order. Returns [] gracefully if that migration hasn't been run yet.
async function getProductVariationGroupOptions(
  supabase: ReturnType<typeof createClient>,
  productId: string
): Promise<VariationGroupOption[]> {
  const { data, error } = await supabase
    .from("product_variation_groups")
    .select(
      "sort_order, group:variation_groups(id, name, layout, sort_order, variation_values(id, value, sort_order))"
    )
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (isMissingTableError(error)) return [];
  if (error) throw error;

  return (
    (data ?? []) as unknown as {
      group: { id: string; name: string; layout: "horizontal" | "vertical"; variation_values: { id: string; value: string; sort_order: number }[] };
    }[]
  ).map(({ group }) => ({
    id: group.id,
    name: group.name,
    layout: group.layout,
    values: [...group.variation_values]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(({ id, value }) => ({ id, value })),
  }));
}

// Which variation values (one per assigned group) each variant represents.
// Returns {} gracefully if migration 0023 hasn't been run yet.
async function getVariantValueIds(
  supabase: ReturnType<typeof createClient>,
  variantIds: string[]
): Promise<Record<string, string[]>> {
  if (variantIds.length === 0) return {};
  const { data, error } = await supabase
    .from("product_variant_values")
    .select("variant_id, value_id")
    .in("variant_id", variantIds);

  if (isMissingTableError(error)) return {};
  if (error) throw error;

  const map: Record<string, string[]> = {};
  for (const row of (data ?? []) as { variant_id: string; value_id: string }[]) {
    (map[row.variant_id] ??= []).push(row.value_id);
  }
  return map;
}

// The variant a "quick add" button (e.g. on a product card) should use:
// the product's own default ("Standard") variant when one exists, else
// its first real variant.
export function pickDefaultVariant(
  variants: { id: string; name: string; price: number; stock_quantity: number; is_default_variant?: boolean }[] | null
): { id: string; name: string; price: number; stock_quantity: number } | null {
  if (!variants || variants.length === 0) return null;
  const preferred = variants.find((v) => v.is_default_variant);
  // Prefer the flagged default if it has stock, otherwise fall back to first in-stock variant, then first overall
  const chosen = (preferred && preferred.stock_quantity > 0)
    ? preferred
    : (variants.find((v) => v.stock_quantity > 0) ?? preferred ?? variants[0]);
  return { id: chosen.id, name: chosen.name, price: chosen.price, stock_quantity: chosen.stock_quantity };
}

export async function getCategories(): Promise<CategoryItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order")
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function getProducts(options?: {
  categorySlug?: string;
  sort?: SortOption;
  search?: string;
}): Promise<ProductListItem[]> {
  const supabase = createClient();
  const categoryJoin = options?.categorySlug
    ? "category:categories!inner(name, slug)"
    : "category:categories(name, slug)";

  function buildQuery(withNewColumns: boolean) {
    let q = supabase
      .from("products")
      .select(
        `id, name, slug, base_price, ${withNewColumns ? "sale_price, hover_image_url, delivery_charge, free_delivery_min_price, free_home_delivery, product_variants(id, name, price, stock_quantity, is_default_variant), " : ""}${categoryJoin}, product_images(id, url, alt_text, sort_order)`
      )
      .eq("is_active", true);

    if (options?.categorySlug) {
      q = q.eq("category.slug", options.categorySlug);
    }
    if (options?.search) {
      q = q.ilike("name", `%${options.search}%`);
    }
    switch (options?.sort) {
      case "price-asc":
        q = q.order("base_price", { ascending: true });
        break;
      case "price-desc":
        q = q.order("base_price", { ascending: false });
        break;
      case "name":
        q = q.order("name", { ascending: true });
        break;
      default:
        // No explicit sort chosen — use the admin's manually drag-and-dropped
        // display order (falls back to name ordering if migration 0017
        // hasn't been run yet against this project).
        q = withNewColumns ? q.order("sort_order", { ascending: true }) : q.order("name", { ascending: true });
    }
    return q;
  }

  function withQuickAddVariant(
    rows: (ProductListItem & { product_variants?: { id: string; name: string; price: number; stock_quantity: number; is_default_variant?: boolean }[] })[]
  ): ProductListItem[] {
    return rows.map(({ product_variants, ...row }) => ({
      ...row,
      quick_add_variant: pickDefaultVariant(product_variants ?? null),
    }));
  }

  const { data, error } = await buildQuery(true);
  if (isMissingColumnError(error)) {
    const fallback = await buildQuery(false);
    if (fallback.error) throw fallback.error;
    return ((fallback.data ?? []) as unknown[]).map((row) => ({
      ...(row as object),
      ...NEW_LIST_DEFAULTS,
    })) as ProductListItem[];
  }
  if (error) throw error;
  return withQuickAddVariant((data ?? []) as unknown as ProductListItem[]);
}

export async function getProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  const supabase = createClient();

  function buildQuery(withNewColumns: boolean) {
    return supabase
      .from("products")
      .select(
        `id, name, slug, description, benefits, how_to_use, before_after_image_url, ${withNewColumns ? "hover_image_url, sale_price, delivery_charge, free_delivery_min_price, free_home_delivery, variant_option_label, " : ""}base_price, seo_title, seo_description, category_id, category:categories(name, slug), product_images(id, url, alt_text, sort_order), product_variants(id, name, sku, price, stock_quantity, image_url${withNewColumns ? ", is_default_variant" : ""})`
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
  }

  // The "Standard" variant mirrors the product's own price/SKU/stock — it's
  // always shown alongside any real variants, never hidden or replaced by
  // them, so customers can still choose the base option after a variant
  // is added. Shown first in the list.
  function pickPurchasableVariants(
    variants: (ProductVariant & { is_default_variant?: boolean })[]
  ): ProductVariant[] {
    return [...variants]
      .sort((a, b) => (b.is_default_variant ? 1 : 0) - (a.is_default_variant ? 1 : 0))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ is_default_variant, ...rest }) => rest);
  }

  const { data, error } = await buildQuery(true);
  if (isMissingColumnError(error)) {
    const fallback = await buildQuery(false);
    if (fallback.error) throw fallback.error;
    return fallback.data
      ? ({
          ...(fallback.data as unknown as Record<string, unknown>),
          ...NEW_DETAIL_DEFAULTS,
        } as unknown as ProductDetail)
      : null;
  }
  if (error) throw error;
  if (!data) return null;
  const product = data as unknown as ProductDetail & {
    product_variants: (ProductVariant & { is_default_variant?: boolean })[];
  };

  const variants = pickPurchasableVariants(product.product_variants ?? []);
  const [variationGroups, valueIdsByVariant] = await Promise.all([
    getProductVariationGroupOptions(supabase, product.id),
    getVariantValueIds(supabase, variants.map((v) => v.id)),
  ]);

  return {
    ...product,
    quick_add_variant: pickDefaultVariant(product.product_variants ?? null),
    variation_groups: variationGroups,
    product_variants: variants.map((v) => ({ ...v, value_ids: valueIdsByVariant[v.id] ?? [] })),
  };
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeProductId: string
): Promise<ProductListItem[]> {
  if (!categoryId) return [];

  const supabase = createClient();

  function buildQuery(withNewColumns: boolean) {
    return supabase
      .from("products")
      .select(
        `id, name, slug, base_price, ${withNewColumns ? "sale_price, hover_image_url, delivery_charge, free_delivery_min_price, free_home_delivery, product_variants(id, name, price, stock_quantity, is_default_variant), " : ""}category:categories(name, slug), product_images(id, url, alt_text, sort_order)`
      )
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .neq("id", excludeProductId)
      .limit(4);
  }

  const { data, error } = await buildQuery(true);
  if (isMissingColumnError(error)) {
    const fallback = await buildQuery(false);
    if (fallback.error) throw fallback.error;
    return ((fallback.data ?? []) as unknown[]).map((row) => ({
      ...(row as object),
      ...NEW_LIST_DEFAULTS,
    })) as ProductListItem[];
  }
  if (error) throw error;
  return (
    (data ?? []) as unknown as (ProductListItem & {
      product_variants?: { id: string; name: string; price: number; stock_quantity: number; is_default_variant?: boolean }[];
    })[]
  ).map(({ product_variants, ...row }) => ({
    ...row,
    quick_add_variant: pickDefaultVariant(product_variants ?? null),
  }));
}

export interface ApprovedReview {
  id: string;
  rating: number;
  body: string | null;
  created_at: string;
  is_verified_purchase: boolean;
}

export async function getApprovedReviews(
  productId: string
): Promise<ApprovedReview[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, body, created_at, is_verified_purchase")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
