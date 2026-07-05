import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ATOM PURE collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },
};

// NOTE: This is placeholder copy, not vetted legal text. Have a lawyer
// review and finalize this page before the site goes live with real customer data.
export default function PrivacyPage() {
  return (
    <Container className="py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
      <div className="mb-8 rounded-xl border border-beige-300 bg-beige-100 p-4">
        <Text className="text-sm text-charcoal-700">
          <strong>Draft — pending legal review.</strong> This page is a
          placeholder and has not been reviewed by a lawyer. Do not treat it
          as a finalized legal document.
        </Text>
      </div>

      <Heading level={1} className="mb-8">
        Privacy Policy
      </Heading>

      <div className="flex max-w-2xl flex-col gap-6">
        <div>
          <Heading level={3} className="mb-2">
            Information We Collect
          </Heading>
          <Text>
            When you place an order or create an account, we collect your
            name, email, phone number, and shipping address. We do not store
            payment card details — payments are handled by our payment
            providers directly.
          </Text>
        </div>
        <div>
          <Heading level={3} className="mb-2">
            How We Use Your Information
          </Heading>
          <Text>
            We use your information to process orders, provide customer
            support, and — only if you opt in — send updates about new
            products. We do not sell your personal information to third
            parties.
          </Text>
        </div>
        <div>
          <Heading level={3} className="mb-2">
            Your Rights
          </Heading>
          <Text>
            You can request access to, correction of, or deletion of your
            personal data at any time by contacting us.
          </Text>
        </div>
        <div>
          <Heading level={3} className="mb-2">
            Contact
          </Heading>
          <Text>
            Questions about this policy? Reach out via our{" "}
            <a href="/contact" className="text-sage-700 underline">
              Contact page
            </a>
            .
          </Text>
        </div>
      </div>
    </Container>
  );
}
