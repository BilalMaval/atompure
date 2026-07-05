import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminCustomers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) throw error;

  // profiles has no email column (it lives in auth.users); resolve via the
  // admin Auth API since service-role REST access to auth.users isn't exposed.
  const admin = createAdminClient();
  const withEmail = await Promise.all(
    (data ?? []).map(async (profile) => {
      const { data: userData } = await admin.auth.admin.getUserById(profile.id);
      return { ...profile, email: userData?.user?.email ?? null };
    })
  );

  return withEmail;
}

export async function getAdminCustomerById(id: string) {
  const supabase = createClient();
  const admin = createAdminClient();

  const [profileRes, ordersRes, userRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("orders")
      .select("id, order_number, total, status, created_at")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
    admin.auth.admin.getUserById(id),
  ]);

  if (profileRes.error) throw profileRes.error;
  if (!profileRes.data) return null;

  return {
    profile: profileRes.data,
    orders: ordersRes.data ?? [],
    email: userRes.data?.user?.email ?? null,
  };
}
