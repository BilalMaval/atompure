"use client";

import { useRef } from "react";
import { useCart } from "@/lib/cart/cart-context";
import { flyToCart } from "@/lib/cart/fly-to-cart";
import { Button } from "@/components/ui/Button";
import type { MyOrder } from "@/lib/data/account";

export function ReorderButton({ order }: { order: MyOrder }) {
  const { addItem, openDrawer } = useCart();
  const btnRef = useRef<HTMLButtonElement>(null);

  function handleReorder() {
    const firstImageUrl = (() => {
      const first = order.order_items[0];
      if (!first) return null;
      return first.image_url
        ?? first.product_variant?.product?.product_images?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url
        ?? null;
    })();
    flyToCart(firstImageUrl, btnRef.current);

    for (const item of order.order_items) {
      const variant = item.product_variant;
      if (!variant?.product) continue;
      const image = [...(variant.product.product_images ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order
      )[0];
      addItem(
        {
          variantId: variant.id,
          productSlug: variant.product.slug,
          productName: variant.product.name,
          variantName: variant.name,
          price: item.unit_price,
          imageUrl: image?.url ?? null,
          // Order-history reorder doesn't carry the product's current
          // delivery settings — defaults mean it falls back to the
          // store-wide free-shipping threshold, same as before this existed.
          freeHomeDelivery: false,
          freeDeliveryMinPrice: null,
          deliveryCharge: null,
        },
        item.quantity
      );
    }
    openDrawer();
  }

  return (
    <Button ref={btnRef} variant="outline" size="sm" onClick={handleReorder}>
      Reorder
    </Button>
  );
}
