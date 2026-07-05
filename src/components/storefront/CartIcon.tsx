"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import { clsx } from "@/lib/utils";

export function CartIcon({ className }: { className?: string }) {
  const { itemCount, openDrawer } = useCart();
  const [bump, setBump] = useState(false);
  const prevCount = useRef(itemCount);

  useEffect(() => {
    const increased = itemCount > prevCount.current;
    prevCount.current = itemCount;
    if (!increased) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(t);
  }, [itemCount]);

  return (
    <button
      id="cart-icon"
      type="button"
      onClick={openDrawer}
      aria-label={`Open bag, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
      className={clsx(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors",
        className ?? "text-charcoal-800 hover:bg-beige-100"
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className={clsx("h-[22px] w-[22px] transition-transform duration-300", bump && "scale-125")}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.94-4.728 2.436-7.235.122-.61-.348-1.179-.97-1.179H5.25M7.5 14.25 5.106 5.272M7.5 14.25 5.25 6m0 0h13.5M9 19.5h.008m6.984 0h.008"
        />
      </svg>
      {itemCount > 0 && (
        <span
          className={clsx(
            "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sage-600 px-1 text-[10px] font-medium text-cream-50 transition-transform duration-300",
            bump && "scale-125"
          )}
        >
          {itemCount}
        </span>
      )}
    </button>
  );
}
