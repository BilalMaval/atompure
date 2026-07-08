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
                // Blur to prevent browser scroll-into-view on focus
                (e.currentTarget as HTMLButtonElement).blur();
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
