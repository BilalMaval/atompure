import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface OrderItemDetail {
  id: string;
  quantity: number;
  unit_price: number;
  image_url: string | null;
  product_name: string | null;
  variant_name: string | null;
  product_variant: {
    name: string;
    product: { name: string; slug: string; product_images: { url: string; sort_order: number }[] } | null;
  } | null;
}

export interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  tax_total: number;
  coupon_code: string | null;
  total: number;
  guest_email: string | null;
  shipping_full_name: string | null;
  shipping_phone: string | null;
  shipping_line1: string | null;
  shipping_line2: string | null;
  shipping_city: string | null;
  shipping_province: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  created_at: string;
  order_items: OrderItemDetail[];
}

export async function getOrderByNumber(
  orderNumber: string
): Promise<OrderDetail | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_method, payment_status, subtotal, shipping_total, discount_total, tax_total, coupon_code, total, guest_email, shipping_full_name, shipping_phone, shipping_line1, shipping_line2, shipping_city, shipping_province, shipping_postal_code, shipping_country, created_at, order_items(id, quantity, unit_price, image_url, product_name, variant_name, product_variant:product_variants(name, product:products(name, slug, product_images(url, sort_order))))"
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as OrderDetail | null;
}
