"use client";

import { useEffect, useState } from "react";
import { Text } from "@/components/ui/Typography";
import { formatPrice } from "@/lib/format";
import { AddToCartForm } from "@/components/storefront/AddToCartForm";
import { effectivePrice } from "@/lib/pricing";
import type { ProductDetail } from "@/lib/data/products";

export function StickyAddToCart({
  product,
  variantId,
  anchorRef,
}: {
  product: ProductDetail;
  variantId: string;
  anchorRef: React.RefObject<HTMLDivElement>;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const variants = product.product_variants ?? [];
  const usesGroups = (product.variation_groups ?? []).length > 0;
  const selectedVariant = usesGroups
    ? variants.find((v) => v.id === variantId)
    : variants.find((v) => v.id === variantId) ?? variants[0];
  const rawPrice = selectedVariant?.price ?? product.base_price;
  const currentPrice = effectivePrice(product.base_price, product.sale_price, rawPrice);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorRef]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-beige-200 bg-cream-50/95 backdrop-blur sm:left-auto sm:right-0 sm:w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <div className="hidden sm:block">
          <Text className="font-medium text-charcoal-800">{product.name}</Text>
          <Text className="text-sm">{formatPrice(currentPrice)}</Text>
        </div>
        <div className="flex-1 sm:flex-none">
          <AddToCartForm
            product={product}
            variantId={variantId}
            onVariantChange={() => {}}
            noMatchingCombination={usesGroups && !selectedVariant}
            compact
          />
        </div>
      </div>
    </div>
  );
}
