"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateTicketStatus(
  ticketId: string,
  status: "open" | "in_progress" | "resolved"
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("support_tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/support-tickets");
  revalidatePath(`/admin/support-tickets/${ticketId}`);
  return { success: true };
}

export async function addTicketReply(ticketId: string, body: string): Promise<ActionResult> {
  await requireAdmin();
  if (!body.trim()) return { success: false, error: "Reply cannot be empty." };

  const supabase = createClient();
  const { error } = await supabase.from("ticket_replies").insert({ ticket_id: ticketId, body });
  if (error) return { success: false, error: error.message };

  // Replying generally means work has started on the ticket.
  await supabase
    .from("support_tickets")
    .update({ status: "in_progress", updated_at: new Date().toISOString() })
    .eq("id", ticketId)
    .eq("status", "open");

  revalidatePath(`/admin/support-tickets/${ticketId}`);
  revalidatePath("/admin/support-tickets");
  return { success: true };
}
