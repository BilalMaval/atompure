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
              isScrolled ? "text-charcoal-800" : "text-cream-50"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-[22px] w-[22px]"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <CartIcon
            className={clsx(
              "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
              isScrolled ? "text-charcoal-800" : "text-cream-50"
            )}
          />
        </div>
      </Container>
    </header>
  );
}
