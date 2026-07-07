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
  freeDeliveryTrackedVariantId: string | null;
  freeDeliveryProgress: number;
  freeDeliveryRemaining: number;
  shippingCost: number;
  originalShippingCost: number;
  thresholdDiscount: number;
  isShippingDiscounted: boolean;
  isGloballyFree: boolean;
  isExplicitlyFree: boolean;
  explicitlyFreeCount: number;
  thresholdFreeCount: number;
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
  // Progress bar: find the item closest to unlocking its own threshold.
  // If no item has a specific threshold, fall back to global (cart total).
  const { freeDeliveryThreshold, freeDeliveryProgress, freeDeliveryRemaining, freeDeliveryTrackedVariantId } = useMemo(() => {
    const candidates = items
      .filter((i) => !i.freeHomeDelivery && i.freeDeliveryMinPrice != null && i.freeDeliveryMinPrice > 0)
      .map((i) => ({
        variantId: i.variantId,
        threshold: i.freeDeliveryMinPrice!,
        spent: i.price * i.quantity,
        remaining: Math.max(0, i.freeDeliveryMinPrice! - i.price * i.quantity),
      }))
      .filter((c) => c.remaining > 0); // exclude already-unlocked ones

    if (candidates.length > 0) {
      // Show the one with the smallest remaining amount (nearest to unlock)
      const nearest = candidates.reduce((a, b) => a.remaining < b.remaining ? a : b);
      return {
        freeDeliveryThreshold: nearest.threshold,
        freeDeliveryProgress: Math.min(100, (nearest.spent / nearest.threshold) * 100),
        freeDeliveryRemaining: nearest.remaining,
        freeDeliveryTrackedVariantId: nearest.variantId,
      };
    }

    // Fall back to global threshold vs cart total
    const remaining = Math.max(0, globalFreeShippingThreshold - subtotal);
    return {
      freeDeliveryThreshold: globalFreeShippingThreshold,
      freeDeliveryProgress: items.length === 0 ? 0 : Math.min(100, (subtotal / globalFreeShippingThreshold) * 100),
      freeDeliveryRemaining: remaining,
      freeDeliveryTrackedVariantId: null,
    };
  }, [items, subtotal, globalFreeShippingThreshold]);

  // Uses the same shared logic as the server checkout action, so what's
  // shown here always matches what the customer is actually charged.
  const {
    shippingCost,
    originalShippingCost,
    thresholdDiscount,
    isDiscounted: isShippingDiscounted,
    isGloballyFree,
    isExplicitlyFree,
    explicitlyFreeCount,
    thresholdFreeCount,
  } = useMemo(
    () => resolveShipping(
      items.map((i) => ({
        freeHomeDelivery: i.freeHomeDelivery,
        freeDeliveryMinPrice: i.freeDeliveryMinPrice,
        deliveryCharge: i.deliveryCharge,
        itemSubtotal: i.price * i.quantity,
      })),
      subtotal,
      globalFreeShippingThreshold,
      flatShippingRate
    ),
    [items, subtotal, globalFreeShippingThreshold, flatShippingRate]
  );

  // Free delivery banner shows when globally free, threshold met, or any item is explicitly free
  const hasFreeDelivery = isGloballyFree || isShippingDiscounted || isExplicitlyFree;

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
        freeDeliveryTrackedVariantId,
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
