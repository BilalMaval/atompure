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
    hasFreeDelivery,
    freeDeliveryThreshold,
    shippingCost,
    originalShippingCost,
    isShippingDiscounted,
  } = useCart();

  const remainingForFreeShipping = hasFreeDelivery
    ? 0
    : Math.max(0, freeDeliveryThreshold - subtotal);
  const progress =
    items.length === 0
      ? 0
      : hasFreeDelivery
        ? 100
        : Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <Container className="py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Bag" }]} />
      <Heading level={1} className="mb-8">
        Your Bag
      </Heading>

      <div className="mb-8 rounded-2xl border border-beige-200 bg-cream-100 p-4">
        {items.length === 0 ? (
          <Text className="text-sm">Add products for free shipping.</Text>
        ) : remainingForFreeShipping > 0 ? (
          <Text className="text-sm">
            Add {formatPrice(remainingForFreeShipping)} more for free shipping.
          </Text>
        ) : (
          <Text className="text-sm text-sage-700">
            You&apos;ve unlocked free shipping!
          </Text>
        )}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-beige-100">
          <div
            className="h-full bg-sage-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <Text>Your bag is empty.</Text>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <ul className="flex flex-col gap-6">
            {items.map((item) => (
              <li
                key={item.variantId}
                className="flex gap-4 border-b border-beige-200 pb-6"
              >
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-beige-100">
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
                  <Text className="text-sm">{item.variantName}</Text>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="h-8 w-8 rounded-full border border-beige-300"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      className="h-8 w-8 rounded-full border border-beige-300"
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
                    className="text-sm text-charcoal-400 hover:text-charcoal-700"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-beige-200 p-6">
            <Heading level={3} className="mb-4">
              Order Summary
            </Heading>
            <div className="mb-1 flex justify-between">
              <Text>Subtotal</Text>
              <Text className="font-medium text-charcoal-800">
                {formatPrice(subtotal)}
              </Text>
            </div>
            <div className="mb-4 flex justify-between">
              <Text>Delivery</Text>
              {isShippingDiscounted ? (
                <span className="flex items-center gap-2">
                  <span className="text-charcoal-400 line-through">{formatPrice(originalShippingCost)}</span>
                  <span className="font-medium text-sage-700">Free</span>
                </span>
              ) : (
                <Text className={shippingCost === 0 ? "font-medium text-sage-700" : "font-medium text-charcoal-800"}>
                  {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                </Text>
              )}
            </div>
            <Link href="/checkout">
              <Button size="lg" className="w-full">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Container>
  );
}
