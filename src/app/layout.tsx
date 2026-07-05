import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { createAdminClient } from "@/lib/supabase/admin";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["100", "300", "400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "ATOM PURE — Organic, Natural, Pure Personal Care",
    template: "%s | ATOM PURE",
  },
  description:
    "ATOM PURE makes organic, natural, and pure personal care products — clean ingredients, no compromises.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
};

interface StoreSettingsForLayout {
  store_name: string | null;
  support_email: string | null;
  support_phone: string | null;
  ga_measurement_id: string | null;
}

async function getStoreSettingsForLayout(): Promise<StoreSettingsForLayout | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("store_settings")
      .select("store_name, support_email, support_phone, ga_measurement_id")
      .eq("id", true)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettingsForLayout();
  const gaMeasurementId = settings?.ga_measurement_id ?? null;

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.store_name ?? "ATOM PURE",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ...(settings?.support_email
      ? { email: settings.support_email }
      : {}),
    ...(settings?.support_phone
      ? { telephone: settings.support_phone }
      : {}),
  };

  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${inter.variable} font-sans antialiased bg-cream-50 text-charcoal-800`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        {gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
