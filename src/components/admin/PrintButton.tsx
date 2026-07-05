"use client";

export function PrintButton() {
  return (
    <button
      className="mt-10 rounded-full bg-sage-600 px-5 py-2 text-sm text-cream-50 print:hidden"
      onClick={() => window.print()}
    >
      Print
    </button>
  );
}
