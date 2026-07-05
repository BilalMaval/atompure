"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { CartIcon } from "@/components/storefront/CartIcon";
import { SearchBar } from "@/components/storefront/SearchBar";
import { Logo } from "@/components/illustrations/Logo";
import { clsx } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const isHome = usePathname() === "/";

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 40);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        isScrolled
          ? "border-b border-white/40 bg-white/70 backdrop-blur-xl backdrop-saturate-150 shadow-sm"
          : isHome
            ? "border-b border-transparent bg-transparent"
            : "border-b border-charcoal-800 bg-charcoal-900"
      )}
    >
      <Container className="grid h-14 grid-cols-3 items-center gap-4">
        <Link
          href="/"
          className={clsx(
            "justify-self-start transition-colors",
            isScrolled ? "text-charcoal-900" : "text-cream-50"
          )}
        >
          <Logo invert={!isScrolled} small />
        </Link>
        <nav
          className={clsx(
            "hidden justify-self-center gap-8 text-sm transition-colors sm:flex",
            isScrolled ? "text-charcoal-600" : "text-cream-100"
          )}
        >
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/blog">Journal</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="flex items-center justify-end gap-1 justify-self-end">
          <div className="hidden lg:block">
            <SearchBar />
          </div>
          <Link
            href="/account"
            aria-label="Account"
            className={clsx(
              "inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
              isScrolled
                ? "text-charcoal-800 hover:bg-beige-100"
                : "text-cream-50 hover:bg-white/10"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[22px] w-[22px]"
              aria-hidden
            >
              <path d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </Link>
          <CartIcon
            className={clsx(
              "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
              isScrolled
                ? "text-charcoal-800 hover:bg-beige-100"
                : "text-cream-50 hover:bg-white/10"
            )}
          />
        </div>
      </Container>
    </header>
  );
}
