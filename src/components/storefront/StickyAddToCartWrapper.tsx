"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Text } from "@/components/ui/Typography";
import { formatPrice } from "@/lib/format";
import { AddToCartForm } from "@/components/storefront/AddToCartForm";
import { StickyAddToCart } from "@/components/storefront/StickyAddToCart";
import { effectivePrice } from "@/lib/pricing";
import type { ProductDetail } from "@/lib/data/products";

export function StickyAddToCartWrapper({
  product,
  onVariantImageChange,
}: {
  product: ProductDetail;
  onVariantImageChange?: (url: string | null) => void;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const variants = useMemo(() => product.product_variants ?? [], [product.product_variants]);
  const groups = useMemo(() => product.variation_groups ?? [], [product.variation_groups]);
  const usesGroups = groups.length > 0;

  const [legacyVariantId, setLegacyVariantId] = useState(variants[0]?.id ?? "");
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(groups.map((g) => [g.id, g.values[0]?.id ?? ""]))
  );

  function handleSelectionChange(groupId: string, valueId: string) {
    setSelection((prev) => ({ ...prev, [groupId]: valueId }));
  }

  // Resolve the single purchasable variant: by exact group-value combination
  // when this product uses the variation-group system, otherwise by the
  // legacy single dropdown's choice.
  const matchedVariant = useMemo(() => {
    if (!usesGroups) return variants.find((v) => v.id === legacyVariantId);
    const groupIds = groups.map((g) => g.id);
    const selectedIds = groupIds.map((id) => selection[id]);
    if (selectedIds.some((id) => !id)) return undefined;
    return variants.find(
      (v) =>
        v.value_ids &&
        v.value_ids.length === selectedIds.length &&
        selectedIds.every((id) => v.value_ids!.includes(id))
    );
  }, [usesGroups, variants, groups, selection, legacyVariantId]);

  const variantId = matchedVariant?.id ?? "";
  const noMatchingCombination = usesGroups && !matchedVariant;

  useEffect(() => {
    onVariantImageChange?.(matchedVariant?.image_url ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedVariant?.id]);

  const basePrice = product.base_price;
  const currentPrice = matchedVariant?.price ?? basePrice;
  const discountedPrice = effectivePrice(product.base_price, product.sale_price, currentPrice);
  const hasDiscount = discountedPrice < currentPrice;
  const percentOff = hasDiscount ? Math.round((1 - discountedPrice / currentPrice) * 100) : null;

  return (
    <div ref={anchorRef} className="flex flex-col gap-6">
      {percentOff !== null ? (
        <div className="flex items-center gap-3">
          <Text className="text-2xl font-medium text-charcoal-900">
            {formatPrice(discountedPrice)}
          </Text>
          <Text className="text-lg text-charcoal-400 line-through">{formatPrice(currentPrice)}</Text>
          <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
            {percentOff}% off
          </span>
        </div>
      ) : (
        <Text className="text-2xl font-medium text-charcoal-900">{formatPrice(currentPrice)}</Text>
      )}

      <AddToCartForm
        product={product}
        variantId={variantId}
        onVariantChange={setLegacyVariantId}
        selection={usesGroups ? selection : undefined}
        onSelectionChange={usesGroups ? handleSelectionChange : undefined}
        noMatchingCombination={noMatchingCombination}
      />
      <StickyAddToCart product={product} variantId={variantId} anchorRef={anchorRef} />
    </div>
  );
}
