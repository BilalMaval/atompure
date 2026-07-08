"use client";

import { useRef, useState, type ReactNode } from "react";
import { clsx } from "@/lib/utils";

interface AccordionItemData {
  title: string;
  content: ReactNode;
}

export function Accordion({ items }: { items: AccordionItemData[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);

  function handleToggle(clickedIndex: number) {
    const isOpen = openIndex === clickedIndex;
    buttonRefs.current[clickedIndex]?.blur();

    if (!isOpen) {
      // Opening a new item — calculate exactly where the clicked button will
      // land after the currently-open panel collapses, then snap there instantly
      // so the layout shift is invisible.
      const btnEl = buttonRefs.current[clickedIndex];
      if (btnEl) {
        const HEADER_H = 56 + 12; // fixed header + gap
        const btnRect = btnEl.getBoundingClientRect();

        // If the currently-open panel is ABOVE the clicked button, collapsing
        // it will shift the button up by that content's natural height.
        let upwardShift = 0;
        if (openIndex !== null && openIndex < clickedIndex) {
          upwardShift = innerRefs.current[openIndex]?.scrollHeight ?? 0;
        }

        const targetScroll =
          window.scrollY + btnRect.top - upwardShift - HEADER_H;
        window.scrollTo({ top: Math.max(0, targetScroll), behavior: "instant" });
      }
    }

    setOpenIndex(isOpen ? null : clickedIndex);
  }

  return (
    <div className="flex flex-col divide-y divide-beige-200 border-y border-beige-200">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.title}>
            <button
              ref={(el) => { buttonRefs.current[index] = el; }}
              type="button"
              onClick={() => handleToggle(index)}
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

            {/* grid-template-rows trick: animates to actual content height */}
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-in-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div
                  ref={(el) => { innerRefs.current[index] = el; }}
                  className="pb-4"
                >
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
