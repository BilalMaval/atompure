"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { CartIcon } from "@/components/storefront/CartIcon";
import { SearchBar } from "@/components/storefront/SearchBar";
import { Logo } from "@/components/illustrations/Logo";
import { clsx } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 40);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
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
        <Container className="flex h-14 items-center gap-4">
          <Link
            href="/"
            className={clsx(
              "flex-shrink-0 transition-colors",
              isScrolled ? "text-charcoal-900" : "text-cream-50"
            )}
          >
            <Logo invert={!isScrolled} small />
          </Link>

          {/* Desktop nav — centered */}
          <nav
            className={clsx(
              "hidden flex-1 justify-center gap-8 text-sm transition-colors sm:flex",
              isScrolled ? "text-charcoal-600" : "text-cream-100"
            )}
          >
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Spacer on mobile so icons stay right */}
          <div className="flex-1 sm:hidden" />

          <div className="flex items-center gap-1">
            <div className="hidden lg:block">
              <SearchBar />
            </div>
            <Link
              href="/account"
              aria-label="Account"
              className={clsx(
                "hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-125 active:scale-95",
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
                "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-125 active:scale-95",
                isScrolled ? "text-charcoal-800" : "text-cream-50"
              )}
            />
            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className={clsx(
                "inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-125 active:scale-95 sm:hidden",
                isScrolled ? "text-charcoal-800" : "text-cream-50"
              )}
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile menu drawer */}
      <div
        className={clsx(
          "fixed inset-x-0 top-14 z-30 overflow-hidden bg-charcoal-900 transition-[max-height] duration-300 ease-in-out sm:hidden",
          menuOpen ? "max-h-64" : "max-h-0"
        )}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col divide-y divide-charcoal-700 px-6 py-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-3.5 text-sm font-medium text-cream-100 transition-colors hover:text-cream-50"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/account"
            className="py-3.5 text-sm font-medium text-cream-100 transition-colors hover:text-cream-50"
          >
            Account
          </Link>
        </nav>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 sm:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}
    </>
  );
}
