import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getStoreSettings() {
  const supabase = createClient();
  const { data, error } = await supabase.from("store_settings").select("*").eq("id", true).maybeSingle();
  if (error) throw error;
  return data;
}
