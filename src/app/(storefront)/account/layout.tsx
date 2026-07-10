import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { clsx } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Profile", href: "/account/profile" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account");

  return (
    <Container className="py-8 sm:py-16">
      {/* Mobile: horizontal scrollable tab strip */}
      <nav className="mb-6 flex gap-1 overflow-x-auto pb-1 lg:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-shrink-0 rounded-full border border-beige-300 px-4 py-1.5 text-sm text-charcoal-600 hover:bg-beige-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {/* Desktop: sidebar */}
      <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
        <nav className="hidden flex-col gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-lg px-3 py-2 text-sm text-charcoal-600 hover:bg-beige-100"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </Container>
  );
}
