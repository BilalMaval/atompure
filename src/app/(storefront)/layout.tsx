import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart/cart-context";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { createAdminClient } from "@/lib/supabase/admin";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/cart/constants";

async function getShippingDefaults(): Promise<{ freeShippingThreshold: number; flatShippingRate: number }> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("store_settings")
      .select("free_shipping_threshold, flat_shipping_rate")
      .eq("id", true)
      .maybeSingle();
    return {
      freeShippingThreshold: data?.free_shipping_threshold ?? FREE_SHIPPING_THRESHOLD,
      flatShippingRate: data?.flat_shipping_rate ?? 0,
    };
  } catch {
    return { freeShippingThreshold: FREE_SHIPPING_THRESHOLD, flatShippingRate: 0 }; // migration 0022 not run yet
  }
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { freeShippingThreshold, flatShippingRate } = await getShippingDefaults();

  return (
    <CartProvider freeShippingThreshold={freeShippingThreshold} flatShippingRate={flatShippingRate}>
      <Header />
      <main className="pt-14">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
