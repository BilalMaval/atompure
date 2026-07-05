"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
  isWishlisted?: boolean;
}

export async function toggleWishlist(productId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You must be signed in to use your wishlist." };
  }

  const { data: existing } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("profile_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("profile_id", user.id)
      .eq("product_id", productId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/account/wishlist");
    return { success: true, isWishlisted: false };
  }

  const { error } = await supabase
    .from("wishlists")
    .insert({ profile_id: user.id, product_id: productId });
  if (error) return { success: false, error: error.message };
  revalidatePath("/account/wishlist");
  return { success: true, isWishlisted: true };
}
