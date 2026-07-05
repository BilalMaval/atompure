import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getAdminTickets(status?: string) {
  const supabase = createClient();
  let query = supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getAdminTicketById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("support_tickets").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  body: string;
  created_at: string;
}

export async function getTicketReplies(ticketId: string): Promise<TicketReply[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ticket_replies")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
