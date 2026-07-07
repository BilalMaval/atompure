"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart/cart-context";
import { Button } from "@/components/ui/Button";
import { Heading, Text } from "@/components/ui/Typography";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    subtotal,
    hasFreeDelivery,
    freeDeliveryProgress,
    freeDeliveryRemaining,
    shippingCost,
    originalShippingCost,
    thresholdDiscount,
    isShippingDiscounted,
    isGloballyFree,
    isExplicitlyFree,
    explicitlyFreeCount,
    thresholdFreeCount,
  } = useCart();

  const progress = hasFreeDelivery ? 100 : freeDeliveryProgress;
  const remainingForFreeShipping = hasFreeDelivery ? 0 : freeDeliveryRemaining;

  return (
    <div
      className={`fixed inset-0 z-50 ${isDrawerOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isDrawerOpen}
    >
      <div
        onClick={closeDrawer}
        className={`absolute inset-0 bg-charcoal-900/40 transition-opacity ${
          isDrawerOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-label="Shopping bag"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream-50 shadow-xl transition-transform duration-300 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-beige-200 p-6">
          <Heading level={3}>Your Bag</Heading>
          <button
            onClick={closeDrawer}
            aria-label="Close bag"
            className="text-charcoal-600 hover:text-charcoal-900"
          >
            &times;
          </button>
        </div>

        {/* Free shipping progress bar — only shown when a global threshold is configured */}
        {(isGloballyFree || freeDeliveryThreshold > 0) && (
          <div className="border-b border-beige-200 px-6 py-4">
            {isGloballyFree ? (
              <Text className="text-sm font-medium text-sage-700">
                🎉 You&apos;ve unlocked free shipping on your entire order!
              </Text>
            ) : remainingForFreeShipping > 0 ? (
              <Text className="text-sm text-charcoal-600">
                Add <span className="font-semibold text-charcoal-900">{formatPrice(remainingForFreeShipping)}</span> more to unlock free shipping on your whole order.
              </Text>
            ) : (
              <Text className="text-sm font-medium text-sage-700">
                ✓ Free shipping unlocked!
              </Text>
            )}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-beige-200">
              <div
                className="h-full bg-sage-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <Text className="text-charcoal-500">Your bag is empty.</Text>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-beige-100">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <Text className="font-medium text-charcoal-800 leading-snug">
                      {item.productName}
                    </Text>
                    <Text className="text-xs text-charcoal-500">{item.variantName}</Text>
                    {item.freeHomeDelivery ? (
                      <span className="w-fit rounded-full bg-sage-50 px-2 py-0.5 text-[10px] font-semibold text-sage-700">
                        Free Delivery
                      </span>
                    ) : item.freeDeliveryMinPrice != null && item.freeDeliveryMinPrice > 0 ? (
                      (() => {
                        const remaining = Math.max(0, item.freeDeliveryMinPrice - item.price * item.quantity);
                        return remaining > 0 ? (
                          <span className="text-[10px] text-charcoal-500">
                            Add <span className="font-semibold text-charcoal-700">{formatPrice(remaining)}</span> more to unlock free shipping
                          </span>
                        ) : (
                          <span className="w-fit rounded-full bg-sage-50 px-2 py-0.5 text-[10px] font-semibold text-sage-700">
                            ✓ Free Shipping Unlocked
                          </span>
                        );
                      })()
                    ) : null}
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="h-7 w-7 rounded-full border border-beige-300 text-sm hover:border-sage-400"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm">{item.quantity}</span>
                      <button
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="h-7 w-7 rounded-full border border-beige-300 text-sm hover:border-sage-400"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Text className="font-medium text-charcoal-800">
                      {formatPrice(item.price * item.quantity)}
                    </Text>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-xs text-charcoal-400 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Order summary */}
        {items.length > 0 && (
          <div className="border-t border-beige-200 p-6 flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <Text className="text-charcoal-600">Subtotal</Text>
              <Text className="font-medium text-charcoal-900">{formatPrice(subtotal)}</Text>
            </div>

            {/* Explicitly free delivery items badge */}
            {isExplicitlyFree && (
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 text-sage-700">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 flex-shrink-0">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                  Free Delivery
                  <span className="text-xs text-sage-600">({explicitlyFreeCount} item{explicitlyFreeCount > 1 ? "s" : ""})</span>
                </span>
                <span className="font-medium text-sage-700">Included</span>
              </div>
            )}

            {/* Threshold discount line */}
            {thresholdDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 text-sage-700">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 flex-shrink-0">
                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                  </svg>
                  Shipping Discount
                  <span className="text-xs text-sage-600">({thresholdFreeCount} item{thresholdFreeCount > 1 ? "s" : ""} unlocked)</span>
                </span>
                <span className="font-medium text-sage-700">−{formatPrice(thresholdDiscount)}</span>
              </div>
            )}

            {/* Delivery charge */}
            <div className="flex justify-between text-sm">
              <Text className="text-charcoal-600">Delivery</Text>
              {isGloballyFree ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-xs text-charcoal-400 line-through">{formatPrice(originalShippingCost)}</span>
                  <span className="font-medium text-sage-700">Free</span>
                </span>
              ) : isShippingDiscounted && originalShippingCost > shippingCost ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-xs text-charcoal-400 line-through">{formatPrice(originalShippingCost)}</span>
                  <span className="font-medium text-charcoal-900">{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                </span>
              ) : (
                <Text className={shippingCost === 0 ? "font-medium text-sage-700" : "font-medium text-charcoal-900"}>
                  {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                </Text>
              )}
            </div>

            <Link href="/cart" onClick={closeDrawer} className="mt-1">
              <Button className="w-full" size="lg">
                View Bag
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
