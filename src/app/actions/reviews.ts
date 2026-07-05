"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createReview(
  productId: string,
  productSlug: string,
  input: ReviewInput
): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You must be signed in to leave a review." };
  }

  const { count } = await supabase
    .from("order_items")
    .select("id, orders!inner(customer_id), product_variants!inner(product_id)", {
      count: "exact",
      head: true,
    })
    .eq("orders.customer_id", user.id)
    .eq("product_variants.product_id", productId);

  const isVerifiedPurchase = (count ?? 0) > 0;

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    customer_id: user.id,
    rating: parsed.data.rating,
    body: parsed.data.body ?? null,
    is_verified_purchase: isVerifiedPurchase,
    status: "pending",
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/shop/${productSlug}`);
  return { success: true };
}
