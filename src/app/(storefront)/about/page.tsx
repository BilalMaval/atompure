import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { Reveal } from "@/components/animation/Reveal";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Learn about ATOM PURE's mission to make organic, natural personal care accessible.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <Container className="py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <Reveal stagger className="flex max-w-2xl flex-col gap-6">
        <Heading level={1}>Personal care, distilled to its purest form.</Heading>
        <Text>
          ATOM PURE started with a simple frustration: most personal care
          products on the shelf are packed with fillers, synthetic fragrances,
          and ingredients we couldn&apos;t pronounce — let alone explain to our
          families. We wanted something simpler. Something pure.
        </Text>
        <Text>
          We began by reformulating the products we used every day —
          teeth whitening powder, hair oil, cooking oil — stripping each one
          down to ingredients that actually belong in them. No parabens, no
          unnecessary additives, no shortcuts.
        </Text>
        <Text>
          Every ATOM PURE product is made in small batches, tested for
          quality, and built around one rule: if we wouldn&apos;t put it on
          our own skin or in our own kitchen, it doesn&apos;t go in the
          bottle.
        </Text>
        <Text>
          We&apos;re just getting started — but every product we ship carries
          the same promise: organic, natural, and pure, with nothing to hide.
        </Text>
      </Reveal>
    </Container>
  );
}
