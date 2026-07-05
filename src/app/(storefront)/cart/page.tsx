"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart/cart-context";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
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

  const progress = isGloballyFree ? 100 : freeDeliveryProgress;
  const remaining = isGloballyFree ? 0 : freeDeliveryRemaining;

  return (
    <Container className="py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Bag" }]} />
      <Heading level={1} className="mb-8">Your Bag</Heading>

      {/* Free shipping progress */}
      <div className="mb-8 rounded-2xl border border-beige-200 bg-cream-100 px-5 py-4">
        {items.length === 0 ? (
          <Text className="text-sm text-charcoal-500">Add products to your bag.</Text>
        ) : isGloballyFree ? (
          <Text className="text-sm font-medium text-sage-700">🎉 Free shipping on your entire order!</Text>
        ) : remaining > 0 ? (
          <Text className="text-sm text-charcoal-600">
            Add <span className="font-semibold text-charcoal-900">{formatPrice(remaining)}</span> more for free shipping.
          </Text>
        ) : (
          <Text className="text-sm font-medium text-sage-700">✓ Free shipping unlocked!</Text>
        )}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-beige-200">
          <div className="h-full bg-sage-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <Text className="text-charcoal-500">Your bag is empty.</Text>
          <Link href="/shop"><Button>Continue Shopping</Button></Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">

          {/* Items list */}
          <ul className="flex flex-col gap-6">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-4 border-b border-beige-200 pb-6">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-beige-100">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <Link
                    href={`/shop/${item.productSlug}`}
                    className="font-medium text-charcoal-800 hover:text-sage-700"
                  >
                    {item.productName}
                  </Link>
                  <Text className="text-sm text-charcoal-500">{item.variantName}</Text>
                  {item.freeHomeDelivery && (
                    <span className="mt-0.5 w-fit rounded-full bg-sage-50 px-2.5 py-0.5 text-[11px] font-semibold text-sage-700">
                      ✓ Free Delivery
                    </span>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="h-8 w-8 rounded-full border border-beige-300 hover:border-sage-400"
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="h-8 w-8 rounded-full border border-beige-300 hover:border-sage-400"
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
                    className="text-sm text-charcoal-400 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Order summary */}
          <div className="rounded-2xl border border-beige-200 bg-cream-50 p-6 flex flex-col gap-3 h-fit">
            <Heading level={3} className="mb-1">Order Summary</Heading>

            <div className="flex justify-between text-sm">
              <Text className="text-charcoal-600">Subtotal</Text>
              <Text className="font-medium text-charcoal-900">{formatPrice(subtotal)}</Text>
            </div>

            {/* Explicitly free items */}
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

            {/* Threshold discount */}
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
            <div className="flex justify-between text-sm border-t border-beige-200 pt-3">
              <Text className="text-charcoal-600">Delivery</Text>
              {isGloballyFree ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-xs text-charcoal-400 line-through">{formatPrice(originalShippingCost)}</span>
                  <span className="font-semibold text-sage-700">Free</span>
                </span>
              ) : isShippingDiscounted && originalShippingCost > shippingCost ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-xs text-charcoal-400 line-through">{formatPrice(originalShippingCost)}</span>
                  <span className="font-semibold text-charcoal-900">{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                </span>
              ) : (
                <Text className={shippingCost === 0 ? "font-semibold text-sage-700" : "font-semibold text-charcoal-900"}>
                  {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                </Text>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between border-t border-beige-200 pt-3">
              <Text className="font-semibold text-charcoal-900">Total</Text>
              <Text className="font-semibold text-charcoal-900">
                {formatPrice(subtotal + shippingCost)}
              </Text>
            </div>

            <Link href="/checkout" className="mt-2">
              <Button size="lg" className="w-full">Proceed to Checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </Container>
  );
}
