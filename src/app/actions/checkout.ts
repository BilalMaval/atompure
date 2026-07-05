"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validations/checkout";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/cart/constants";
import { effectivePrice } from "@/lib/pricing";
import { resolveShipping } from "@/lib/shipping";
import { isMissingColumnError } from "@/lib/supabase/errors";
import { sendOrderConfirmationEmail } from "@/lib/email";

interface CreateOrderResult {
  success: boolean;
  orderNumber?: string;
  error?: string;
}

interface CouponPreviewResult {
  success: boolean;
  error?: string;
  discountType?: "percent" | "fixed";
  value?: number;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AP-${timestamp}-${random}`;
}

async function getValidCoupon(admin: ReturnType<typeof createAdminClient>, code: string) {
  const { data: coupon } = await admin
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (!coupon) return null;
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return null;
  if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) return null;
  return coupon;
}

export async function validateCoupon(code: string): Promise<CouponPreviewResult> {
  if (!code.trim()) return { success: false, error: "Enter a coupon code." };
  const admin = createAdminClient();
  const coupon = await getValidCoupon(admin, code);
  if (!coupon) return { success: false, error: "Invalid or expired coupon code." };
  return { success: true, discountType: coupon.discount_type, value: coupon.value };
}

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { checkout, items } = parsed.data;

  const supabaseServer = createServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  const admin = createAdminClient();

  const variantIds = items.map((i) => i.variantId);

  // Per-product delivery overrides (migration 0016) — fall back to plain
  // variant fields if that migration hasn't been run against this project yet.
  let variants: {
    id: string;
    price: number;
    stock_quantity: number;
    product?: {
      base_price: number;
      sale_price: number | null;
      delivery_charge: number | null;
      free_delivery_min_price: number | null;
      free_home_delivery: boolean | null;
    } | null;
  }[] = [];
  const withDelivery = await admin
    .from("product_variants")
    .select(
      "id, price, stock_quantity, product:products(base_price, sale_price, delivery_charge, free_delivery_min_price, free_home_delivery)"
    )
    .in("id", variantIds);

  if (isMissingColumnError(withDelivery.error)) {
    const plain = await admin
      .from("product_variants")
      .select("id, price, stock_quantity")
      .in("id", variantIds);
    if (plain.error) {
      return { success: false, error: "Could not verify product availability." };
    }
    variants = (plain.data ?? []) as typeof variants;
  } else if (withDelivery.error) {
    return { success: false, error: "Could not verify product availability." };
  } else {
    variants = (withDelivery.data ?? []) as unknown as typeof variants;
  }

  const variantMap = new Map(variants.map((v) => [v.id, v]));

  let subtotal = 0;
  const orderItems: { product_variant_id: string; quantity: number; unit_price: number; image_url: string | null; product_name: string | null; variant_name: string | null }[] = [];
  const deliveryCandidates: {
    deliveryCharge: number | null;
    freeDeliveryMinPrice: number | null;
    freeHomeDelivery: boolean;
    itemSubtotal: number;
  }[] = [];

  for (const item of items) {
    const variant = variantMap.get(item.variantId);
    if (!variant) {
      return { success: false, error: "One of the items in your cart is no longer available." };
    }
    if (variant.stock_quantity < item.quantity) {
      return { success: false, error: "One of the items in your cart is out of stock." };
    }
    const unitPrice = variant.product
      ? effectivePrice(variant.product.base_price, variant.product.sale_price, variant.price)
      : variant.price;
    subtotal += unitPrice * item.quantity;
    orderItems.push({
      product_variant_id: item.variantId,
      quantity: item.quantity,
      unit_price: unitPrice,
      image_url: item.imageUrl ?? null,
      product_name: item.productName ?? null,
      variant_name: item.variantName ?? null,
    });
    deliveryCandidates.push({
      deliveryCharge: variant.product?.delivery_charge ?? null,
      freeDeliveryMinPrice: variant.product?.free_delivery_min_price ?? null,
      freeHomeDelivery: variant.product?.free_home_delivery ?? false,
      itemSubtotal: unitPrice * item.quantity,
    });
  }

  let discountTotal = 0;
  let appliedCouponCode: string | null = null;
  if (checkout.couponCode) {
    const coupon = await getValidCoupon(admin, checkout.couponCode);
    if (!coupon) {
      return { success: false, error: "Invalid or expired coupon code." };
    }
    discountTotal =
      coupon.discount_type === "percent"
        ? subtotal * (coupon.value / 100)
        : Math.min(coupon.value, subtotal);
    appliedCouponCode = coupon.code;
  }

  let settingsResult = await admin
    .from("store_settings")
    .select("flat_shipping_rate, tax_rate_percent, free_shipping_threshold")
    .eq("id", true)
    .maybeSingle();
  if (isMissingColumnError(settingsResult.error)) {
    // free_shipping_threshold column may not exist yet (migration 0022 not run).
    settingsResult = await admin
      .from("store_settings")
      .select("flat_shipping_rate, tax_rate_percent")
      .eq("id", true)
      .maybeSingle();
  }
  const settings = settingsResult.data;

  const flatShippingRate = settings?.flat_shipping_rate ?? 0;
  const taxRatePercent = settings?.tax_rate_percent ?? 0;
  const freeShippingThreshold =
    (settings as { free_shipping_threshold?: number } | null)?.free_shipping_threshold ??
    FREE_SHIPPING_THRESHOLD;

  const { shippingCost: shippingTotal } = resolveShipping(
    deliveryCandidates,
    subtotal,
    freeShippingThreshold,
    flatShippingRate
  );

  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const taxTotal = taxableAmount * (taxRatePercent / 100);
  const total = taxableAmount + shippingTotal + taxTotal;

  if (user && checkout.saveAddress) {
    await supabaseServer.from("addresses").insert({
      profile_id: user.id,
      full_name: checkout.fullName,
      phone: checkout.phone,
      line1: checkout.line1,
      line2: checkout.line2 ?? null,
      city: checkout.city,
      province: checkout.province ?? null,
      postal_code: checkout.postalCode ?? null,
      country: checkout.country,
    });
  }

  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await admin.rpc("place_order", {
    p_order: {
      order_number: orderNumber,
      customer_id: user?.id ?? null,
      guest_email: user ? null : checkout.email,
      payment_method: checkout.paymentMethod,
      subtotal,
      shipping_total: shippingTotal,
      discount_total: discountTotal,
      tax_total: taxTotal,
      total,
      notes: checkout.notes ?? null,
      coupon_code: appliedCouponCode,
      shipping_full_name: checkout.fullName,
      shipping_phone: checkout.phone,
      shipping_line1: checkout.line1,
      shipping_line2: checkout.line2 ?? null,
      shipping_city: checkout.city,
      shipping_province: checkout.province ?? null,
      shipping_postal_code: checkout.postalCode ?? null,
      shipping_country: checkout.country,
    },
    p_items: orderItems,
  });

  if (orderError) {
    if (orderError.message?.includes("insufficient_stock")) {
      return { success: false, error: "One of the items in your cart is out of stock." };
    }
    return { success: false, error: "Could not place your order. Please try again." };
  }

  const finalOrderNumber = order?.order_number ?? orderNumber;
  const recipientEmail = user?.email ?? checkout.email ?? null;

  if (recipientEmail) {
    // Fire-and-forget — email failure must never block the order response
    sendOrderConfirmationEmail({
      orderNumber: finalOrderNumber,
      toEmail: recipientEmail,
      toName: checkout.fullName,
      items: orderItems.map((oi, i) => ({
        productName: oi.product_name ?? items[i]?.productName ?? "Product",
        variantName: oi.variant_name ?? items[i]?.variantName ?? "",
        quantity: oi.quantity,
        unitPrice: oi.unit_price,
      })),
      subtotal,
      discountTotal,
      couponCode: appliedCouponCode,
      shippingTotal,
      taxTotal,
      total,
      shippingAddress: {
        fullName: checkout.fullName,
        phone: checkout.phone,
        line1: checkout.line1,
        line2: checkout.line2 ?? null,
        city: checkout.city,
        province: checkout.province ?? null,
        postalCode: checkout.postalCode ?? null,
      },
    }).catch((err) => console.error("[email] order confirmation failed:", err));
  }

  return { success: true, orderNumber: finalOrderNumber };
}
