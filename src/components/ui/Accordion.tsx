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
              onClick={() => setOpenIndex(isOpen ? null : index)}
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
            <div
              className={clsx(
                "overflow-hidden transition-all duration-300",
                isOpen ? "max-h-[1000px] pb-4 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
