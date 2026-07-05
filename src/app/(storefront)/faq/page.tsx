import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Typography";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { FaqAccordion } from "@/components/storefront/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about ATOM PURE products, shipping, and ingredients.",
  alternates: { canonical: "/faq" },
};

const FAQ_ITEMS = [
  {
    question: "Are ATOM PURE products really free of parabens and harsh chemicals?",
    answer:
      "Yes — every product is formulated without parabens, sulfates, or synthetic fragrances. Full ingredient lists are listed on each product page.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Orders within Pakistan typically arrive within 3-5 business days. You'll see your order status update in your account once it ships.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We currently support Cash on Delivery (COD). JazzCash and Easypaisa are coming soon.",
  },
  {
    question: "Can I return a product if I'm not satisfied?",
    answer:
      "Yes, see our Shipping & Returns page for the full policy and how to start a return.",
  },
  {
    question: "Do you test on animals?",
    answer: "Never. All ATOM PURE products are cruelty-free.",
  },
] as const;

export default function FaqPage() {
  return (
    <Container className="py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
      <Heading level={1} className="mb-8">
        Frequently Asked Questions
      </Heading>
      <FaqAccordion items={FAQ_ITEMS} />
    </Container>
  );
}
