"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import {
  variationGroupSchema,
  variationValueSchema,
  type VariationGroupInput,
  type VariationValueInput,
} from "@/lib/validations/admin/variations";

interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

export async function createVariationGroup(input: VariationGroupInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = variationGroupSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const { count } = await supabase.from("variation_groups").select("id", { count: "exact", head: true });
  const { data, error } = await supabase
    .from("variation_groups")
    .insert({ name: parsed.data.name, layout: parsed.data.layout, sort_order: count ?? 0 })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/variations");
  return { success: true, id: data.id };
}

export async function updateVariationGroup(id: string, input: VariationGroupInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = variationGroupSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const { error } = await supabase
    .from("variation_groups")
    .update({ name: parsed.data.name, layout: parsed.data.layout, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/variations");
  return { success: true, id };
}

export async function deleteVariationGroup(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("variation_groups").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/variations");
  return { success: true };
}

export async function reorderVariationGroups(orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase.from("variation_groups").update({ sort_order: i }).eq("id", orderedIds[i]);
    if (error) return { success: false, error: error.message };
  }
  revalidatePath("/admin/variations");
  return { success: true };
}

export async function createVariationValue(groupId: string, input: VariationValueInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = variationValueSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const { count } = await supabase
    .from("variation_values")
    .select("id", { count: "exact", head: true })
    .eq("group_id", groupId);
  const { error } = await supabase
    .from("variation_values")
    .insert({ group_id: groupId, value: parsed.data.value, sort_order: count ?? 0 });

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/variations");
  return { success: true };
}

export async function updateVariationValue(
  id: string,
  input: VariationValueInput
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = variationValueSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const { error } = await supabase.from("variation_values").update({ value: parsed.data.value }).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/variations");
  return { success: true };
}

export async function deleteVariationValue(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("variation_values").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/variations");
  return { success: true };
}

export async function reorderVariationValues(orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase.from("variation_values").update({ sort_order: i }).eq("id", orderedIds[i]);
    if (error) return { success: false, error: error.message };
  }
  revalidatePath("/admin/variations");
  return { success: true };
}

// Replaces the full set of groups assigned to a product, in the given
// order — the simplest way to keep this consistent without a diffing step.
export async function setProductVariationGroups(
  productId: string,
  orderedGroupIds: string[]
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();

  const { error: deleteError } = await supabase
    .from("product_variation_groups")
    .delete()
    .eq("product_id", productId);
  if (deleteError) return { success: false, error: deleteError.message };

  if (orderedGroupIds.length > 0) {
    const { error: insertError } = await supabase.from("product_variation_groups").insert(
      orderedGroupIds.map((groupId, index) => ({
        product_id: productId,
        group_id: groupId,
        sort_order: index,
      }))
    );
    if (insertError) return { success: false, error: insertError.message };
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  return { success: true };
}
