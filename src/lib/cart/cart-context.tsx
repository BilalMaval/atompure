"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CART_STORAGE_KEY, FREE_SHIPPING_THRESHOLD } from "./constants";
import { resolveShipping } from "@/lib/shipping";

export interface CartItem {
  variantId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  freeHomeDelivery: boolean;
  freeDeliveryMinPrice: number | null;
  deliveryCharge: number | null;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  subtotal: number;
  itemCount: number;
  hasFreeDelivery: boolean;
  freeDeliveryThreshold: number;
  shippingCost: number;
  originalShippingCost: number;
  isShippingDiscounted: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  freeShippingThreshold: globalFreeShippingThreshold = FREE_SHIPPING_THRESHOLD,
  flatShippingRate = 0,
}: {
  children: ReactNode;
  freeShippingThreshold?: number;
  flatShippingRate?: number;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        // corrupted cart data; start fresh
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  // Does not open the drawer itself — callers decide whether a drawer
  // popup makes sense for their context (e.g. the cart icon does; "Add to
  // Bag" and "Buy Now" don't, they confirm via their own button feedback).
  function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }

  function removeItem(variantId: string) {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }

  function updateQuantity(variantId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );
  }

  function clear() {
    setItems([]);
  }

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );
  // A product's own free-delivery threshold (e.g. "free above Rs 1600") is
  // a better deal for the customer than the generic store-wide threshold
  // (e.g. Rs 2500) — show progress toward whichever is lower so "add X
  // more" reflects the threshold that's actually achievable, not a number
  // that ignores the product-specific offer entirely.
  const freeDeliveryThreshold = useMemo(() => {
    const productThresholds = items
      .map((i) => i.freeDeliveryMinPrice)
      .filter((v): v is number => v != null && v > 0);
    return productThresholds.length
      ? Math.min(globalFreeShippingThreshold, ...productThresholds)
      : globalFreeShippingThreshold;
  }, [items, globalFreeShippingThreshold]);

  // Uses the same shared logic as the server checkout action, so what's
  // shown here always matches what the customer is actually charged.
  const { shippingCost, originalShippingCost, isDiscounted: isShippingDiscounted, isExplicitlyFree } = useMemo(
    () => resolveShipping(items, subtotal, globalFreeShippingThreshold, flatShippingRate),
    [items, subtotal, globalFreeShippingThreshold, flatShippingRate]
  );

  // Only show "Free Delivery" when explicitly toggled on a product or when the
  // threshold discount kicks in — not when the flat rate just happens to be 0.
  const hasFreeDelivery = isExplicitlyFree || isShippingDiscounted;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clear,
        subtotal,
        itemCount,
        hasFreeDelivery,
        freeDeliveryThreshold,
        shippingCost,
        originalShippingCost,
        isShippingDiscounted,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
