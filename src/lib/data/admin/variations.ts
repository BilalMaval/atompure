import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isMissingTableError } from "@/lib/supabase/errors";

export interface AdminVariationValue {
  id: string;
  value: string;
  sort_order: number;
}

export interface AdminVariationGroup {
  id: string;
  name: string;
  layout: "horizontal" | "vertical";
  sort_order: number;
  variation_values: AdminVariationValue[];
}

export async function getVariationGroups(): Promise<AdminVariationGroup[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("variation_groups")
    .select("id, name, layout, sort_order, variation_values(id, value, sort_order)")
    .order("sort_order", { ascending: true });
  if (isMissingTableError(error)) return []; // migration 0023 not run yet
  if (error) throw error;
  const groups = (data ?? []) as unknown as AdminVariationGroup[];
  groups.forEach((g) => g.variation_values.sort((a, b) => a.sort_order - b.sort_order));
  return groups;
}

// The groups assigned to one product, in that product's own display order
// (independent of the group's global default order in the library).
export async function getProductVariationGroups(productId: string): Promise<AdminVariationGroup[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("product_variation_groups")
    .select(
      "sort_order, group:variation_groups(id, name, layout, sort_order, variation_values(id, value, sort_order))"
    )
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (isMissingTableError(error)) return []; // migration 0023 not run yet
  if (error) throw error;

  return ((data ?? []) as unknown as { group: AdminVariationGroup }[]).map(({ group }) => {
    group.variation_values.sort((a, b) => a.sort_order - b.sort_order);
    return group;
  });
}
