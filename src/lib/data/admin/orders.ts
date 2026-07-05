import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getAdminOrders(filters?: { status?: string; paymentStatus?: string }) {
  const supabase = createClient();
  let query = supabase
    .from("orders")
    .select("id, order_number, total, status, payment_status, payment_method, guest_email, created_at")
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.paymentStatus) query = query.eq("payment_status", filters.paymentStatus);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export interface AdminOrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  image_url: string | null;
  product_name: string | null;
  variant_name: string | null;
  product_variant: {
    name: string;
    sku: string;
    product: { name: string; slug: string } | null;
  } | null;
}

export interface AdminOrderDetail {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  tax_total: number;
  coupon_code: string | null;
  total: number;
  notes: string | null;
  guest_email: string | null;
  shipping_full_name: string | null;
  shipping_phone: string | null;
  shipping_line1: string | null;
  shipping_line2: string | null;
  shipping_city: string | null;
  shipping_province: string | null;
  shipping_postal_code: string | null;
  order_items: AdminOrderItem[];
  customer: { id: string; full_name: string | null; phone: string | null; email?: string | null } | null;
}

export async function getAdminOrderById(id: string): Promise<AdminOrderDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, order_items(id, quantity, unit_price, image_url, product_name, variant_name, product_variant:product_variants(name, sku, product:products(name, slug))), customer:profiles(id, full_name, phone)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as AdminOrderDetail | null;
}
