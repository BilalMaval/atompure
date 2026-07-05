import { getMyAddresses } from "@/lib/data/addresses";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";

export default async function CheckoutPage() {
  const supabase = createClient();
  const [{ data: { user } }, addresses] = await Promise.all([
    supabase.auth.getUser(),
    getMyAddresses(),
  ]);

  return <CheckoutForm isLoggedIn={Boolean(user)} userEmail={user?.email} addresses={addresses} />;
}
