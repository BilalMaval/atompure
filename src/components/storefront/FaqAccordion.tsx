interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="flex flex-col divide-y divide-beige-200">
      {items.map((item) => (
        <details key={item.question} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-charcoal-800">
            {item.question}
            <span className="ml-4 text-sage-600 transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-charcoal-600">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
