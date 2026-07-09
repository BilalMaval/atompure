"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { isMissingColumnError } from "@/lib/supabase/errors";
import { productSchema, variantSchema, type ProductInput, type VariantInput } from "@/lib/validations/admin/product";

interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

// The product's own price/SKU/stock IS a variant — the "Standard" one.
// It's always kept in sync with the product's fields and always shown
// alongside any real variants the admin adds, so adding a variant never
// hides or overrides the base price; it just adds another choice next to it.
async function syncDefaultVariant(
  supabase: ReturnType<typeof createClient>,
  productId: string,
  sku: string | null,
  basePrice: number,
  stockQuantity: number,
  baseVariantName: string
) {
  const { data: variants, error: fetchError } = await supabase
    .from("product_variants")
    .select("id, is_default_variant")
    .eq("product_id", productId);

  if (isMissingColumnError(fetchError)) return; // migration 0019 not run yet
  if (fetchError || !variants) return;

  const existingDefault = variants.find((v) => v.is_default_variant);
  const variantSku = sku || `SKU-${productId.slice(0, 8)}`;

  if (existingDefault) {
    await supabase
      .from("product_variants")
      .update({ name: baseVariantName, sku: variantSku, price: basePrice, stock_quantity: stockQuantity })
      .eq("id", existingDefault.id);
  } else {
    await supabase.from("product_variants").insert({
      product_id: productId,
      name: baseVariantName,
      sku: variantSku,
      price: basePrice,
      stock_quantity: stockQuantity,
      is_default_variant: true,
    });
  }
}

// Migrations 0019 (sku/stock_quantity) and 0021 (base_variant_name/
// variant_option_label) may each independently not have been run yet —
// try the fullest payload first and progressively drop just the columns
// that don't exist, rather than dropping everything at the first failure.
async function withColumnFallback<T>(
  attempts: Array<() => PromiseLike<{ data: T | null; error: { code?: string | null; message?: string | null } | null }>>
): Promise<{ data: T | null; error: { code?: string | null; message?: string | null } | null }> {
  let result: { data: T | null; error: { code?: string | null; message?: string | null } | null } = {
    data: null,
    error: null,
  };
  for (const attempt of attempts) {
    result = await attempt();
    if (!result.error || !isMissingColumnError(result.error)) return result;
  }
  return result;
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  // A threshold of exactly 0 would mean "free delivery on everything," which
  // is never the intent of this field — treat 0 the same as not set.
  const freeDeliveryMinPrice = parsed.data.freeDeliveryMinPrice || null;

  const supabase = createClient();
  const corePayload = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    category_id: parsed.data.categoryId || null,
    description: parsed.data.description ?? null,
    benefits: parsed.data.benefits ?? null,
    how_to_use: parsed.data.howToUse ?? null,
    base_price: parsed.data.basePrice,
    sale_price: parsed.data.salePrice ?? null,
    delivery_charge: parsed.data.freeHomeDelivery ? null : parsed.data.deliveryCharge ?? null,
    free_delivery_min_price: parsed.data.freeHomeDelivery ? null : freeDeliveryMinPrice,
    free_home_delivery: parsed.data.freeHomeDelivery,
    is_active: parsed.data.isActive,
    seo_title: parsed.data.seoTitle ?? null,
    seo_description: parsed.data.seoDescription ?? null,
  };

  const { data, error } = await withColumnFallback<{ id: string }>([
    () =>
      supabase
        .from("products")
        .insert({
          ...corePayload,
          sku: parsed.data.sku || null,
          stock_quantity: parsed.data.stockQuantity,
          base_variant_name: parsed.data.baseVariantName || "Standard",
          variant_option_label: parsed.data.variantOptionLabel || "Size",
        })
        .select("id")
        .single(),
    () =>
      supabase
        .from("products")
        .insert({ ...corePayload, sku: parsed.data.sku || null, stock_quantity: parsed.data.stockQuantity })
        .select("id")
        .single(),
    () => supabase.from("products").insert(corePayload).select("id").single(),
  ]);

  if (error || !data) return { success: false, error: error?.message ?? "Could not create product." };

  await syncDefaultVariant(
    supabase,
    data.id,
    parsed.data.sku || null,
    parsed.data.basePrice,
    parsed.data.stockQuantity,
    parsed.data.baseVariantName || "Standard"
  );

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true, id: data.id };
}

export async function updateProduct(id: string, input: ProductInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  // A threshold of exactly 0 would mean "free delivery on everything," which
  // is never the intent of this field — treat 0 the same as not set.
  const freeDeliveryMinPrice = parsed.data.freeDeliveryMinPrice || null;

  const supabase = createClient();
  const corePayload = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    category_id: parsed.data.categoryId || null,
    description: parsed.data.description ?? null,
    benefits: parsed.data.benefits ?? null,
    how_to_use: parsed.data.howToUse ?? null,
    base_price: parsed.data.basePrice,
    sale_price: parsed.data.salePrice ?? null,
    delivery_charge: parsed.data.freeHomeDelivery ? null : parsed.data.deliveryCharge ?? null,
    free_delivery_min_price: parsed.data.freeHomeDelivery ? null : freeDeliveryMinPrice,
    free_home_delivery: parsed.data.freeHomeDelivery,
    is_active: parsed.data.isActive,
    seo_title: parsed.data.seoTitle ?? null,
    seo_description: parsed.data.seoDescription ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await withColumnFallback<null>([
    () =>
      supabase
        .from("products")
        .update({
          ...corePayload,
          sku: parsed.data.sku || null,
          stock_quantity: parsed.data.stockQuantity,
          base_variant_name: parsed.data.baseVariantName || "Standard",
          variant_option_label: parsed.data.variantOptionLabel || "Size",
        })
        .eq("id", id),
    () =>
      supabase
        .from("products")
        .update({ ...corePayload, sku: parsed.data.sku || null, stock_quantity: parsed.data.stockQuantity })
        .eq("id", id),
    () => supabase.from("products").update(corePayload).eq("id", id),
  ]);

  if (error) return { success: false, error: error.message ?? "Could not update product." };

  await syncDefaultVariant(
    supabase,
    id,
    parsed.data.sku || null,
    parsed.data.basePrice,
    parsed.data.stockQuantity,
    parsed.data.baseVariantName || "Standard"
  );

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/shop");
  revalidatePath(`/shop/${parsed.data.slug}`);
  return { success: true, id };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}

export async function reorderProducts(orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();

  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("products")
      .update({ sort_order: i })
      .eq("id", orderedIds[i]);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/products/order");
  revalidatePath("/shop");
  return { success: true };
}

export async function createVariant(
  productId: string,
  input: VariantInput,
  valueIds?: string[]
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = variantSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("product_variants")
    .insert({
      product_id: productId,
      name: parsed.data.name,
      sku: parsed.data.sku,
      price: parsed.data.price,
      stock_quantity: parsed.data.stockQuantity,
      image_url: parsed.data.imageUrl ?? null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  if (valueIds && valueIds.length > 0) {
    const { error: linkError } = await supabase
      .from("product_variant_values")
      .insert(valueIds.map((valueId) => ({ variant_id: data.id, value_id: valueId })));
    if (linkError) return { success: false, error: linkError.message };
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  return { success: true, id: data.id };
}

export async function updateVariant(
  variantId: string,
  productId: string,
  input: VariantInput,
  valueIds?: string[]
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = variantSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("product_variants")
    .update({
      name: parsed.data.name,
      sku: parsed.data.sku,
      price: parsed.data.price,
      stock_quantity: parsed.data.stockQuantity,
      image_url: parsed.data.imageUrl ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", variantId);

  if (error) return { success: false, error: error.message };

  if (valueIds) {
    const { error: deleteError } = await supabase
      .from("product_variant_values")
      .delete()
      .eq("variant_id", variantId);
    if (deleteError) return { success: false, error: deleteError.message };
    if (valueIds.length > 0) {
      const { error: linkError } = await supabase
        .from("product_variant_values")
        .insert(valueIds.map((valueId) => ({ variant_id: variantId, value_id: valueId })));
      if (linkError) return { success: false, error: linkError.message };
    }
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  return { success: true };
}

export async function deleteVariant(variantId: string, productId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("product_variants").delete().eq("id", variantId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function addProductImage(
  productId: string,
  url: string,
  altText: string,
  sortOrder: number
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, url, alt_text: altText || null, sort_order: sortOrder });

  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  return { success: true };
}

export async function deleteProductImage(imageId: string, productId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  return { success: true };
}

export async function updateBeforeAfterImage(
  productId: string,
  url: string | null
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update({ before_after_image_url: url })
    .eq("id", productId);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  return { success: true };
}

export async function updateBeforeAfterDisplay(
  productId: string,
  height: number,
  position: string
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update({ before_after_image_height: height, before_after_image_position: position })
    .eq("id", productId);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/shop`);
  return { success: true };
}

export async function updateHoverImage(
  productId: string,
  url: string | null
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update({ hover_image_url: url })
    .eq("id", productId);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true };
}

export async function reorderProductImage(
  imageId: string,
  productId: string,
  sortOrder: number
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("product_images")
    .update({ sort_order: sortOrder })
    .eq("id", imageId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}
