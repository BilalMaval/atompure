"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function submitContactForm(input: ContactInput): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Anonymous inserts go through the admin client — anon-role RLS writes are
  // unreliable on this project (see migration 0012), so this server action
  // is the actual gate instead of RLS.
  const admin = createAdminClient();
  const { error } = await admin.from("support_tickets").insert({
    customer_id: user?.id ?? null,
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  if (error) return { success: false, error: "Could not send your message. Please try again." };
  return { success: true };
}
