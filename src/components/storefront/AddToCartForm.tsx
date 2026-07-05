"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/cart-context";
import { Button } from "@/components/ui/Button";
import { effectivePrice } from "@/lib/pricing";
import { clsx } from "@/lib/utils";
import { flyToCart } from "@/lib/cart/fly-to-cart";
import type { ProductDetail } from "@/lib/data/products";

export function AddToCartForm({
  product,
  variantId,
  onVariantChange,
  selection,
  onSelectionChange,
  noMatchingCombination = false,
  compact = false,
}: {
  product: ProductDetail;
  variantId: string;
  onVariantChange: (variantId: string) => void;
  // Present only when the product uses the variation-group system (one or
  // more groups assigned) — groupId -> selected valueId. Absent falls back
  // to the legacy single free-text variant dropdown.
  selection?: Record<string, string>;
  onSelectionChange?: (groupId: string, valueId: string) => void;
  noMatchingCombination?: boolean;
  compact?: boolean;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const variants = product.product_variants ?? [];
  const groups = product.variation_groups ?? [];
  const usesGroups = Boolean(selection && onSelectionChange);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addToBagRef = useRef<HTMLButtonElement>(null);

  const selectedVariant = variants.find((v) => v.id === variantId);
  const noVariantsConfigured = variants.length === 0;
  const outOfStock = !noVariantsConfigured && !noMatchingCombination && (!selectedVariant || selectedVariant.stock_quantity <= 0);
  const productImage = product.product_images?.[0];

  function buildCartItem() {
    if (!selectedVariant) return null;
    return {
      variantId: selectedVariant.id,
      productSlug: product.slug,
      productName: product.name,
      variantName: selectedVariant.name,
      price: effectivePrice(product.base_price, product.sale_price, selectedVariant.price),
      imageUrl: selectedVariant.image_url ?? productImage?.url ?? null,
      freeHomeDelivery: product.free_home_delivery,
      freeDeliveryMinPrice: product.free_delivery_min_price,
      deliveryCharge: product.delivery_charge,
    };
  }

  function handleAddToBag() {
    const item = buildCartItem();
    if (!item) return;
    flyToCart(selectedVariant?.image_url ?? productImage?.url ?? null, addToBagRef.current);
    addItem(item, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  }

  function handleBuyNow() {
    const item = buildCartItem();
    if (!item) return;
    addItem(item, quantity);
    router.push("/cart");
  }

  const disabled = noVariantsConfigured || noMatchingCombination || outOfStock;
  const buttonLabel = noVariantsConfigured
    ? "Unavailable"
    : noMatchingCombination
      ? "Unavailable"
      : outOfStock
        ? "Out of Stock"
        : justAdded
          ? "Added"
          : "Add to Bag";

  if (compact) {
    return (
      <Button
        ref={addToBagRef}
        type="button"
        size="md"
        onClick={handleAddToBag}
        disabled={disabled}
        className={clsx("w-full gap-1.5 sm:w-auto transition-transform duration-200", justAdded && "scale-[1.03]")}
      >
        {justAdded ? <CheckIcon /> : <BagIcon />}
        {buttonLabel}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {usesGroups
        ? groups.map((group) => (
            <div key={group.id}>
              <label className="mb-1 block text-sm font-medium">{group.name}</label>
              {group.layout === "horizontal" ? (
                <div className="flex flex-wrap gap-2">
                  {group.values.map((value) => (
                    <button
                      key={value.id}
                      type="button"
                      onClick={() => onSelectionChange!(group.id, value.id)}
                      className={clsx(
                        "rounded-full border px-4 py-1.5 text-sm",
                        selection![group.id] === value.id
                          ? "border-sage-600 bg-sage-600 text-cream-50"
                          : "border-beige-300 text-charcoal-700"
                      )}
                    >
                      {value.value}
                    </button>
                  ))}
                </div>
              ) : (
                <select
                  value={selection![group.id] ?? ""}
                  onChange={(e) => onSelectionChange!(group.id, e.target.value)}
                  className="h-11 w-full rounded-lg border border-beige-300 bg-cream-50 px-4 text-sm sm:w-auto"
                >
                  {group.values.map((value) => (
                    <option key={value.id} value={value.id}>
                      {value.value}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))
        : variants.length > 1 && (
            <div>
              <label htmlFor="variant" className="mb-1 block text-sm font-medium">
                {product.variant_option_label || "Size"}
              </label>
              <select
                id="variant"
                value={variantId}
                onChange={(e) => onVariantChange(e.target.value)}
                className="h-11 rounded-lg border border-beige-300 bg-cream-50 px-4 text-sm"
              >
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name}
                  </option>
                ))}
              </select>
            </div>
          )}

      {noMatchingCombination && (
        <p className="text-xs text-red-600">This combination is currently unavailable.</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="h-9 w-9 rounded-full border border-beige-300"
        >
          -
        </button>
        <span>{quantity}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQuantity((q) => q + 1)}
          className="h-9 w-9 rounded-full border border-beige-300"
        >
          +
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        <Button
          ref={addToBagRef}
          type="button"
          size="md"
          onClick={handleAddToBag}
          disabled={disabled}
          className={clsx(
            "w-full gap-2 text-sm font-semibold tracking-wide shadow-sm transition-all duration-200",
            justAdded && "scale-[1.015] bg-sage-700"
          )}
        >
          {justAdded ? <CheckIcon /> : <BagIcon />}
          {buttonLabel}
        </Button>
        <Button
          type="button"
          size="md"
          variant="outline"
          onClick={handleBuyNow}
          disabled={disabled}
          className="w-full gap-2 text-sm font-semibold tracking-wide"
        >
          <BoltIcon />
          Buy Now
        </Button>
      </div>
      {noVariantsConfigured && (
        <p className="text-xs text-charcoal-400">
          This product has no purchasable options yet.
        </p>
      )}
    </div>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7a1.5 1.5 0 0 1-1.5-1.5L6 8Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
  );
}
