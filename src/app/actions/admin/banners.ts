"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { bannerSchema, type BannerInput } from "@/lib/validations/admin/banner";

interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

function toRow(input: BannerInput) {
  return {
    mode: input.mode,
    product_id: input.productId || null,
    category_id: input.categoryId || null,
    custom_link: input.customLink || null,
    heading: input.heading || null,
    heading_size: input.headingSize,
    heading_position: input.headingPosition,
    background_color: input.backgroundColor,
    background_image_url: input.backgroundImageUrl || null,
    image_url: input.imageUrl || null,
    image_position: input.imagePosition,
    button_text: input.buttonText,
    is_active: input.isActive,
  };
}

export async function createBanner(input: BannerInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const { data: maxRow } = await supabase
    .from("homepage_banners")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("homepage_banners")
    .insert({ ...toRow(parsed.data), sort_order: (maxRow?.sort_order ?? -1) + 1 })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/homepage-banners");
  revalidatePath("/");
  return { success: true, id: data.id };
}

export async function updateBanner(id: string, input: BannerInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const { error } = await supabase
    .from("homepage_banners")
    .update({ ...toRow(parsed.data), updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/homepage-banners");
  revalidatePath("/");
  return { success: true, id };
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("homepage_banners").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/homepage-banners");
  revalidatePath("/");
  return { success: true };
}

export async function toggleBannerActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("homepage_banners")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/homepage-banners");
  revalidatePath("/");
  return { success: true };
}

export async function reorderBanner(id: string, sortOrder: number): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("homepage_banners")
    .update({ sort_order: sortOrder })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/homepage-banners");
  revalidatePath("/");
  return { success: true };
}
