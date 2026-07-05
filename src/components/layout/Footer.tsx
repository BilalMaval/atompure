import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { Logo } from "@/components/illustrations/Logo";

const FOOTER_LINKS = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Journal", href: "/blog" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    heading: "Policies",
    links: [
      { label: "Shipping & Returns", href: "/shipping-returns" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-charcoal-800 bg-charcoal-900">
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3 lg:col-span-1">
          <Link href="/" className="text-cream-50">
            <Logo invert large />
          </Link>
          <Text className="text-sm !text-charcoal-400">Organic. Natural. Pure.</Text>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.heading} className="flex flex-col gap-3">
            <Heading level={4} className="text-sm uppercase tracking-wide !text-charcoal-400">
              {group.heading}
            </Heading>
            <ul className="flex flex-col gap-2 text-sm text-cream-100/70">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-sage-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <Container className="border-t border-charcoal-800 py-6 text-sm !text-cream-100/40">
        &copy; {new Date().getFullYear()} ATOM PURE. All rights reserved.
      </Container>
    </footer>
  );
}
