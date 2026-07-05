// Shared shipping-resolution logic, used identically by the client cart
// (for up-front display) and the server checkout action (for the actual
// charge) so the two can never disagree.
//
// Priority per item:
//   1. Explicit "free home delivery" toggle -> always free.
//   2. Otherwise, free once subtotal reaches this item's own threshold
//      (free_delivery_min_price) if it has one, else the store-wide
//      global free-shipping threshold.
//   3. Until then, charge this item's own delivery_charge override if set,
//      else the store-wide flat shipping rate.
// Items ship together, so the cart is charged the single highest
// requirement among them, not a sum.
export interface ShippingItemInput {
  freeHomeDelivery: boolean;
  freeDeliveryMinPrice: number | null;
  deliveryCharge: number | null;
}

export interface ShippingResolution {
  shippingCost: number;
  // The charge that would apply if the free-shipping threshold hadn't been
  // reached — lets the UI show "was Rs X, now free" instead of just "Free".
  originalShippingCost: number;
  isDiscounted: boolean;
  // True only when an item has the explicit "free home delivery" toggle on —
  // distinguishes intentional free delivery from a flat rate that happens to be 0.
  isExplicitlyFree: boolean;
}

export function resolveShipping(
  items: ShippingItemInput[],
  subtotal: number,
  globalFreeShippingThreshold: number,
  flatShippingRate: number
): ShippingResolution {
  if (items.length === 0) {
    return { shippingCost: 0, originalShippingCost: 0, isDiscounted: false };
  }

  const perItem = items.map((item) => {
    if (item.freeHomeDelivery) {
      // Always free by explicit admin choice — not a threshold discount.
      return { resolved: 0, original: 0 };
    }
    const threshold =
      item.freeDeliveryMinPrice != null && item.freeDeliveryMinPrice > 0
        ? item.freeDeliveryMinPrice
        : globalFreeShippingThreshold;
    const baseCharge = item.deliveryCharge != null ? item.deliveryCharge : flatShippingRate;
    const resolved = subtotal >= threshold ? 0 : baseCharge;
    return { resolved, original: baseCharge };
  });

  const shippingCost = Math.max(...perItem.map((p) => p.resolved));
  const originalShippingCost = Math.max(...perItem.map((p) => p.original));
  const isExplicitlyFree = items.some((item) => item.freeHomeDelivery);

  return {
    shippingCost,
    originalShippingCost,
    isDiscounted: shippingCost === 0 && originalShippingCost > 0,
    isExplicitlyFree,
  };
}
