// Shipping resolution logic — used identically by the client cart (display)
// and the server checkout action (actual charge) so they can never disagree.
//
// Rules (evaluated per item, items ship together as one parcel):
//   1. Global threshold met (subtotal >= globalFreeShippingThreshold)
//      → entire cart ships free.
//   2. Admin "free home delivery" toggle on a product
//      → that product's charge is free (not the whole cart).
//   3. Product-specific threshold met (subtotal >= item.freeDeliveryMinPrice)
//      → that product's charge is discounted (subtracted from highest charge).
//   4. Otherwise → that item contributes its own charge (or the flat rate).
//
// The cart is charged the highest single item charge, minus the sum of all
// threshold-unlocked discounts, capped at zero (never negative).

export interface ShippingItemInput {
  freeHomeDelivery: boolean;
  freeDeliveryMinPrice: number | null;
  deliveryCharge: number | null;
  itemSubtotal: number; // price × quantity for this item only
}

export interface ShippingResolution {
  shippingCost: number;
  originalShippingCost: number;   // highest charge before discounts
  thresholdDiscount: number;      // total subtracted via threshold unlocks
  isGloballyFree: boolean;        // global threshold was met
  isExplicitlyFree: boolean;      // at least one item has free home delivery toggled
  explicitlyFreeCount: number;    // how many items have free home delivery
  thresholdFreeCount: number;     // how many items had their threshold met
  isDiscounted: boolean;          // any discount applied (threshold or global)
}

export function resolveShipping(
  items: ShippingItemInput[],
  subtotal: number,
  globalFreeShippingThreshold: number,
  flatShippingRate: number
): ShippingResolution {
  const empty: ShippingResolution = {
    shippingCost: 0,
    originalShippingCost: 0,
    thresholdDiscount: 0,
    isGloballyFree: false,
    isExplicitlyFree: false,
    explicitlyFreeCount: 0,
    thresholdFreeCount: 0,
    isDiscounted: false,
  };
  if (items.length === 0) return empty;

  // Rule 1: global threshold — whole cart free
  const isGloballyFree =
    globalFreeShippingThreshold > 0 && subtotal >= globalFreeShippingThreshold;

  if (isGloballyFree) {
    const originalShippingCost = Math.max(
      0,
      ...items.map((i) => (i.deliveryCharge != null ? i.deliveryCharge : flatShippingRate))
    );
    return {
      shippingCost: 0,
      originalShippingCost,
      thresholdDiscount: originalShippingCost,
      isGloballyFree: true,
      isExplicitlyFree: items.some((i) => i.freeHomeDelivery),
      explicitlyFreeCount: items.filter((i) => i.freeHomeDelivery).length,
      thresholdFreeCount: items.length,
      isDiscounted: true,
    };
  }

  // Per-item evaluation
  const perItem = items.map((item) => {
    const charge = item.deliveryCharge != null ? item.deliveryCharge : flatShippingRate;

    if (item.freeHomeDelivery) {
      // Company-offered free delivery — item ships free, tracked separately
      return { charge, isExplicitlyFree: true, isThresholdFree: false };
    }

    const threshold =
      item.freeDeliveryMinPrice != null && item.freeDeliveryMinPrice > 0
        ? item.freeDeliveryMinPrice
        : null;

    // Use this item's own subtotal — another product's spend must not count
    const isThresholdFree = threshold != null && item.itemSubtotal >= threshold;

    return { charge, isExplicitlyFree: false, isThresholdFree };
  });

  // Highest charge among non-explicitly-free items governs
  const chargeableItems = perItem.filter((p) => !p.isExplicitlyFree);
  const originalShippingCost =
    chargeableItems.length > 0
      ? Math.max(0, ...chargeableItems.map((p) => p.charge))
      : 0;

  // Threshold-unlocked items contribute their charge as a discount
  const thresholdDiscount = chargeableItems
    .filter((p) => p.isThresholdFree)
    .reduce((sum, p) => sum + p.charge, 0);

  const shippingCost = Math.max(0, originalShippingCost - thresholdDiscount);

  const explicitlyFreeCount = perItem.filter((p) => p.isExplicitlyFree).length;
  const thresholdFreeCount = chargeableItems.filter((p) => p.isThresholdFree).length;

  return {
    shippingCost,
    originalShippingCost,
    thresholdDiscount,
    isGloballyFree: false,
    isExplicitlyFree: explicitlyFreeCount > 0,
    explicitlyFreeCount,
    thresholdFreeCount,
    isDiscounted: thresholdDiscount > 0,
  };
}
