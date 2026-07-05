import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { ContactForm } from "@/components/storefront/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the ATOM PURE team — we're happy to help.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Container className="py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <Heading level={1} className="mb-4">
        Get in Touch
      </Heading>
      <Text className="mb-10 max-w-xl">
        Questions about an order, our ingredients, or anything else? Send us a
        message and our team will get back to you.
      </Text>
      <ContactForm />
    </Container>
  );
}
