"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const emailSchema = z.string().email("Enter a valid email");

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function subscribeToNewsletter(email: string): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { success: false, error: "Enter a valid email" };
  }

  // Anonymous inserts go through the admin client — anon-role RLS writes are
  // unreliable on this project (see migration 0012 + checkout's guest-order
  // path for the same pattern), so this server action is the actual gate
  // instead of RLS.
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: parsed.data.toLowerCase() });

  if (error) {
    if (error.code === "23505") {
      return { success: true };
    }
    return { success: false, error: "Could not subscribe. Please try again." };
  }

  return { success: true };
}
