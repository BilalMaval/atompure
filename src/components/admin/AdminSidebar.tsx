"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/utils";
import { Logo } from "@/components/illustrations/Logo";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Homepage Banners", href: "/admin/homepage-banners" },
  { label: "Atombook (Home)", href: "/admin/homepage-products" },
  { label: "Categories (Home)", href: "/admin/homepage-categories" },
  { label: "Results Gallery", href: "/admin/results-gallery" },
  { label: "Products", href: "/admin/products" },
  { label: "Variations", href: "/admin/variations" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Reviews", href: "/admin/reviews" },
  { label: "Coupons", href: "/admin/coupons" },
  { label: "Support Tickets", href: "/admin/support-tickets" },
  { label: "Blog", href: "/admin/blog" },
  { label: "Settings", href: "/admin/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex w-56 flex-shrink-0 flex-col gap-1 border-r border-beige-200 bg-cream-100 p-4">
      <div className="mb-2 px-2 text-charcoal-900">
        <Logo />
      </div>
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "rounded-lg px-3 py-2 text-sm",
              isActive
                ? "bg-sage-600 text-cream-50"
                : "text-charcoal-600 hover:bg-beige-100"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
