import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface Address {
  id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  province: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
}

export async function getMyAddresses(): Promise<Address[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("addresses")
    .select("id, full_name, phone, line1, line2, city, province, postal_code, country, is_default")
    .eq("profile_id", user.id)
    .order("is_default", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
