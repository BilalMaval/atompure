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

        <div className="border-b border-beige-200 px-6 py-4">
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

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <Text>Your bag is empty.</Text>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-beige-100">
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
                    <Text className="font-medium text-charcoal-800">
                      {item.productName}
                    </Text>
                    <Text className="text-xs">{item.variantName}</Text>
                    <div className="flex items-center gap-2">
                      <button
                        aria-label="Decrease quantity"
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        className="h-7 w-7 rounded-full border border-beige-300 text-sm"
                      >
                        -
                      </button>
                      <span className="text-sm">{item.quantity}</span>
                      <button
                        aria-label="Increase quantity"
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        className="h-7 w-7 rounded-full border border-beige-300 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Text className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </Text>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-xs text-charcoal-400 hover:text-charcoal-700"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-beige-200 p-6">
            <div className="mb-1 flex justify-between text-sm">
              <Text>Subtotal</Text>
              <Text>{formatPrice(subtotal)}</Text>
            </div>
            <div className="mb-4 flex justify-between text-sm">
              <Text>Delivery</Text>
              {isShippingDiscounted ? (
                <span className="flex items-center gap-2">
                  <span className="text-charcoal-400 line-through">{formatPrice(originalShippingCost)}</span>
                  <span className="font-medium text-sage-700">Free</span>
                </span>
              ) : (
                <Text className={shippingCost === 0 ? "text-sage-700" : undefined}>
                  {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                </Text>
              )}
            </div>
            <Link href="/cart" onClick={closeDrawer}>
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
