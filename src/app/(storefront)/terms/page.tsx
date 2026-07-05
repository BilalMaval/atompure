import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms governing use of the ATOM PURE website and purchases.",
  alternates: { canonical: "/terms" },
};

// NOTE: This is placeholder copy, not vetted legal text. Have a lawyer
// review and finalize this page before the site goes live.
export default function TermsPage() {
  return (
    <Container className="py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Terms & Conditions" }]} />
      <div className="mb-8 rounded-xl border border-beige-300 bg-beige-100 p-4">
        <Text className="text-sm text-charcoal-700">
          <strong>Draft — pending legal review.</strong> This page is a
          placeholder and has not been reviewed by a lawyer. Do not treat it
          as a finalized legal document.
        </Text>
      </div>

      <Heading level={1} className="mb-8">
        Terms &amp; Conditions
      </Heading>

      <div className="flex max-w-2xl flex-col gap-6">
        <div>
          <Heading level={3} className="mb-2">
            Orders
          </Heading>
          <Text>
            By placing an order on AtomPureLife.com, you confirm the
            information provided is accurate. We reserve the right to
            cancel or refuse any order at our discretion.
          </Text>
        </div>
        <div>
          <Heading level={3} className="mb-2">
            Pricing
          </Heading>
          <Text>
            Prices are listed in PKR and may change without notice. We make
            every effort to ensure pricing accuracy but reserve the right to
            correct errors.
          </Text>
        </div>
        <div>
          <Heading level={3} className="mb-2">
            Product Use
          </Heading>
          <Text>
            Our products are intended for personal care and culinary use as
            described. Please review ingredients before use if you have
            known allergies or sensitivities.
          </Text>
        </div>
        <div>
          <Heading level={3} className="mb-2">
            Limitation of Liability
          </Heading>
          <Text>
            ATOM PURE is not liable for indirect or incidental damages
            arising from the use of our products beyond their intended
            purpose.
          </Text>
        </div>
      </div>
    </Container>
  );
}
