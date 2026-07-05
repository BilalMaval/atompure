export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Discount percentage (rounded) when salePrice is a genuine discount off basePrice. */
export function discountPercent(basePrice: number, salePrice: number | null): number | null {
  if (salePrice == null || salePrice >= basePrice || basePrice <= 0) return null;
  return Math.round((1 - salePrice / basePrice) * 100);
}
