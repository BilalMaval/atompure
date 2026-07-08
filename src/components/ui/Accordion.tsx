"use client";

import { useState, type ReactNode } from "react";
import { clsx } from "@/lib/utils";

interface AccordionItemData {
  title: string;
  content: ReactNode;
}

export function Accordion({ items }: { items: AccordionItemData[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col divide-y divide-beige-200 border-y border-beige-200">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.title}>
            <button
              type="button"
              onClick={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.blur();
                // If opening, instantly snap scroll so this header sits just
                // below the fixed header before the layout shifts.
                if (!isOpen) {
                  const rect = btn.getBoundingClientRect();
                  const headerH = 56; // h-14
                  const target = window.scrollY + rect.top - headerH - 12;
                  window.scrollTo({ top: Math.max(0, target), behavior: "instant" });
                }
                setOpenIndex(isOpen ? null : index);
              }}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span className="font-display text-lg text-charcoal-900">{item.title}</span>
              <span
                className={clsx(
                  "flex-shrink-0 text-xl text-sage-600 transition-transform duration-200",
                  isOpen && "rotate-45"
                )}
                aria-hidden
              >
                +
              </span>
            </button>
            {/* CSS grid row animation — no max-height jumping */}
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-in-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="pb-4">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
