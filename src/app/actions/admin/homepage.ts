"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function setFeaturedProducts(orderedProductIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();

  const { error: delError } = await supabase
    .from("homepage_featured_products")
    .delete()
    .not("id", "is", null);
  if (delError) return { success: false, error: delError.message };

  if (orderedProductIds.length) {
    const rows = orderedProductIds.map((product_id, index) => ({ product_id, sort_order: index }));
    const { error } = await supabase.from("homepage_featured_products").insert(rows);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/homepage-products");
  return { success: true };
}

export async function setFeaturedCategories(orderedCategoryIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();

  const { error: delError } = await supabase
    .from("homepage_featured_categories")
    .delete()
    .not("id", "is", null);
  if (delError) return { success: false, error: delError.message };

  if (orderedCategoryIds.length) {
    const rows = orderedCategoryIds.map((category_id, index) => ({ category_id, sort_order: index }));
    const { error } = await supabase.from("homepage_featured_categories").insert(rows);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/homepage-categories");
  return { success: true };
}

export async function addResultImage(
  url: string,
  altText: string,
  sortOrder: number
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("results_gallery")
    .insert({ image_url: url, alt_text: altText || null, sort_order: sortOrder });

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/results-gallery");
  return { success: true };
}

export async function deleteResultImage(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("results_gallery").delete().eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/results-gallery");
  return { success: true };
}

export async function reorderResultImages(orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();

  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("results_gallery")
      .update({ sort_order: i })
      .eq("id", orderedIds[i]);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/results-gallery");
  return { success: true };
}

export async function toggleResultActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("results_gallery")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/results-gallery");
  return { success: true };
}
