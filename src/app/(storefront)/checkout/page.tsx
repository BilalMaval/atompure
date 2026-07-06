import { getMyAddresses } from "@/lib/data/addresses";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";

export default async function CheckoutPage() {
  const supabase = createClient();
  const admin = createAdminClient();
  const [{ data: { user } }, addresses, { data: settings }] = await Promise.all([
    supabase.auth.getUser(),
    getMyAddresses(),
    admin.from("store_settings").select("tax_rate_percent").eq("id", true).maybeSingle(),
  ]);

  const taxRatePercent: number = (settings as { tax_rate_percent?: number } | null)?.tax_rate_percent ?? 0;

  return (
    <CheckoutForm
      isLoggedIn={Boolean(user)}
      userEmail={user?.email}
      addresses={addresses}
      taxRatePercent={taxRatePercent}
    />
  );
}
