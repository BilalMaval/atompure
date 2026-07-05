import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface MyOrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  image_url: string | null;
  product_name: string | null;
  variant_name: string | null;
  product_variant: {
    id: string;
    name: string;
    product: {
      name: string;
      slug: string;
      product_images: { url: string; sort_order: number }[];
    } | null;
  } | null;
}

export interface MyOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  order_items: MyOrderItem[];
}

export async function getMyOrders(): Promise<MyOrder[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, total, created_at, order_items(id, quantity, unit_price, image_url, product_name, variant_name, product_variant:product_variants(id, name, product:products(name, slug, product_images(url, sort_order))))"
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as MyOrder[];
}

export interface MyWishlistItem {
  product_id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    sale_price: number | null;
    hover_image_url: string | null;
    category: { name: string; slug: string } | null;
    product_images: { id: string; url: string; alt_text: string | null; sort_order: number }[];
    quick_add_variant: { id: string; name: string; price: number; stock_quantity: number } | null;
    delivery_charge: number | null;
    free_delivery_min_price: number | null;
    free_home_delivery: boolean;
  } | null;
}

// Postgres "column does not exist" — covers the window before a given
// migration (0015 hover_image_url, 0016 sale_price) has been run against
// the live project.
const UNDEFINED_COLUMN = "42703";

const WISHLIST_PRODUCT_DEFAULTS = {
  hover_image_url: null,
  sale_price: null,
  quick_add_variant: null,
  delivery_charge: null,
  free_delivery_min_price: null,
  free_home_delivery: false,
};

function pickDefaultVariant(
  variants: { id: string; name: string; price: number; stock_quantity: number; is_default_variant?: boolean }[] | null | undefined
): { id: string; name: string; price: number; stock_quantity: number } | null {
  if (!variants || variants.length === 0) return null;
  const chosen = variants.find((v) => v.is_default_variant) ?? variants[0];
  return { id: chosen.id, name: chosen.name, price: chosen.price, stock_quantity: chosen.stock_quantity };
}

export async function getMyWishlist(): Promise<MyWishlistItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const userId = user.id;

  function buildQuery(withNewColumns: boolean) {
    return supabase
      .from("wishlists")
      .select(
        `product_id, product:products(id, name, slug, base_price, ${withNewColumns ? "sale_price, hover_image_url, delivery_charge, free_delivery_min_price, free_home_delivery, product_variants(id, name, price, stock_quantity, is_default_variant), " : ""}category:categories(name, slug), product_images(id, url, alt_text, sort_order))`
      )
      .eq("profile_id", userId);
  }

  const { data, error } = await buildQuery(true);
  if (error?.code === UNDEFINED_COLUMN) {
    const fallback = await buildQuery(false);
    if (fallback.error) throw fallback.error;
    return ((fallback.data ?? []) as unknown[]).map((row) => {
      const r = row as { product: object | null };
      return {
        ...r,
        product: r.product ? { ...r.product, ...WISHLIST_PRODUCT_DEFAULTS } : null,
      };
    }) as MyWishlistItem[];
  }
  if (error) throw error;
  return (
    (data ?? []) as unknown as {
      product_id: string;
      product: (object & { product_variants?: { id: string; name: string; price: number; stock_quantity: number; is_default_variant?: boolean }[] }) | null;
    }[]
  ).map((row) => {
    if (!row.product) return { ...row, product: null };
    const { product_variants, ...product } = row.product;
    return { ...row, product: { ...product, quick_add_variant: pickDefaultVariant(product_variants) } };
  }) as MyWishlistItem[];
}

export async function getMyWishlistProductIds(): Promise<Set<string>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase.from("wishlists").select("product_id").eq("profile_id", user.id);
  return new Set((data ?? []).map((row) => row.product_id));
}
