"use client";

import { useRef, useState, type ReactNode } from "react";
import { clsx } from "@/lib/utils";

interface AccordionItemData {
  title: string;
  content: ReactNode;
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItemData;
  isOpen: boolean;
  onToggle: (opening: boolean) => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);

  function handleClick() {
    const opening = !isOpen;
    btnRef.current?.blur();
    onToggle(opening);

    if (opening) {
      // Wait for the 300ms CSS transition to finish, then scroll the
      // header to sit just below the fixed nav (56px) — by then the
      // previous panel has fully collapsed so getBoundingClientRect is accurate.
      setTimeout(() => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        const offset = 56 + 12; // fixed header height + gap
        window.scrollTo({
          top: window.scrollY + rect.top - offset,
          behavior: "smooth",
        });
      }, 310);
    }
  }

  return (
    <div>
      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
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

      {/* CSS grid-template-rows trick: smooth height animation without max-height jump */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pb-4">{item.content}</div>
        </div>
      </div>
    </div>
  );
}

export function Accordion({ items }: { items: AccordionItemData[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col divide-y divide-beige-200 border-y border-beige-200">
      {items.map((item, index) => (
        <AccordionItem
          key={item.title}
          item={item}
          isOpen={openIndex === index}
          onToggle={(opening) => setOpenIndex(opening ? index : null)}
        />
      ))}
    </div>
  );
}
