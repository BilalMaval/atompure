// A product's sale_price is a discount *ratio* relative to its base_price,
// applied proportionally to whichever variant is selected — not a separate
// fixed price. This keeps a single "Sale price" field meaningful even when
// variants are priced differently from each other.
export function effectivePrice(
  basePrice: number,
  salePrice: number | null,
  variantPrice: number
): number {
  if (salePrice == null || salePrice >= basePrice || basePrice <= 0) {
    return variantPrice;
  }
  return variantPrice * (salePrice / basePrice);
}
