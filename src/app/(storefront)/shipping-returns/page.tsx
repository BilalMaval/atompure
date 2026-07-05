import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "ATOM PURE shipping times, costs, and our returns policy.",
  alternates: { canonical: "/shipping-returns" },
};

export default function ShippingReturnsPage() {
  return (
    <Container className="py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shipping & Returns" }]} />
      <Heading level={1} className="mb-8">
        Shipping &amp; Returns
      </Heading>

      <div className="flex max-w-2xl flex-col gap-8">
        <div>
          <Heading level={3} className="mb-2">
            Shipping
          </Heading>
          <Text>
            We currently ship within Pakistan. Orders are processed within 1-2
            business days and typically arrive within 3-5 business days,
            depending on your location. You&apos;ll receive updates on your
            order status from your account dashboard.
          </Text>
        </div>

        <div>
          <Heading level={3} className="mb-2">
            Returns &amp; Exchanges
          </Heading>
          <Text>
            If you&apos;re not satisfied with your order, contact us within 7
            days of delivery and we&apos;ll arrange a return or exchange for
            unopened, unused products. Reach out via our{" "}
            <a href="/contact" className="text-sage-700 underline">
              Contact page
            </a>{" "}
            with your order number and we&apos;ll take it from there.
          </Text>
        </div>

        <div>
          <Heading level={3} className="mb-2">
            Damaged or Incorrect Items
          </Heading>
          <Text>
            If your order arrives damaged or you received the wrong item,
            let us know within 48 hours of delivery and we&apos;ll send a
            replacement at no extra cost.
          </Text>
        </div>
      </div>
    </Container>
  );
}
