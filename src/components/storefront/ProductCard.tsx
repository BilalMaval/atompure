"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heading, Text } from "@/components/ui/Typography";
import { useCart } from "@/lib/cart/cart-context";
import { flyToCart } from "@/lib/cart/fly-to-cart";
import { effectivePrice } from "@/lib/pricing";
import { clsx } from "@/lib/utils";
import type { ProductListItem } from "@/lib/data/products";
import { formatPrice, discountPercent } from "@/lib/format";

export function ProductCard({ product }: { product: ProductListItem }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [justAdded, setJustAdded] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const image = product.product_images?.sort(
    (a, b) => a.sort_order - b.sort_order
  )[0];
  const percentOff = discountPercent(product.base_price, product.sale_price);

  const variant = product.quick_add_variant;
  const hasVariant = Boolean(variant);
  const canQuickAdd = Boolean(variant && variant.stock_quantity > 0);

  function buildCartItem() {
    if (!variant) return null;
    return {
      variantId: variant.id,
      productSlug: product.slug,
      productName: product.name,
      variantName: variant.name,
      price: effectivePrice(product.base_price, product.sale_price, variant.price),
      imageUrl: image?.url ?? null,
      freeHomeDelivery: product.free_home_delivery,
      freeDeliveryMinPrice: product.free_delivery_min_price,
      deliveryCharge: product.delivery_charge,
    };
  }

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const item = buildCartItem();
    if (!item) return;
    flyToCart(image?.url ?? null, addBtnRef.current);
    addItem(item, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const item = buildCartItem();
    if (!item) return;
    addItem(item, 1);
    router.push("/cart");
  }

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="flex flex-col gap-4 rounded-[2rem] bg-cream-50 p-4 shadow-md shadow-charcoal-900/[0.06] transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-sage-900/15">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-beige-100 to-beige-200">
          {image ? (
            <>
              <Image
                src={image.url}
                alt={image.alt_text ?? product.name}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className={
                  product.hover_image_url
                    ? "object-cover transition-opacity duration-300 ease-out group-hover:opacity-0"
                    : "object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                }
              />
              {product.hover_image_url && (
                <Image
                  src={product.hover_image_url}
                  alt={image.alt_text ?? product.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sage-400">
              <span className="font-display text-sm">ATOM PURE</span>
            </div>
          )}
          {percentOff !== null && (
            <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white">
              {percentOff}% off
            </span>
          )}
          <span className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-cream-50 text-sage-700 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M17 8l4 4m0 0-4 4m4-4H3" />
            </svg>
          </span>

          {hasVariant && (
            <div className="absolute bottom-3 left-3 flex translate-y-2 items-center gap-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {canQuickAdd ? (
                <>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="flex h-7 items-center gap-1 rounded-full border border-white/60 bg-white/35 px-3 text-[10px] font-semibold text-charcoal-900 shadow-md backdrop-blur-md transition-colors hover:bg-white/50"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5 flex-shrink-0" aria-hidden>
                      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
                    </svg>
                    Buy Now
                  </button>
                  <button
                    ref={addBtnRef}
                    type="button"
                    onClick={handleQuickAdd}
                    className={clsx(
                      "flex h-7 items-center gap-1 rounded-full border px-3 text-[10px] font-semibold shadow-md backdrop-blur-md transition-all duration-200",
                      justAdded
                        ? "scale-[1.03] border-sage-400/80 bg-sage-700/90 text-white"
                        : "border-sage-400/60 bg-sage-700/60 text-white hover:bg-sage-700/75"
                    )}
                  >
                    {justAdded ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-2.5 w-2.5 flex-shrink-0" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-2.5 w-2.5 flex-shrink-0" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7a1.5 1.5 0 0 1-1.5-1.5L6 8Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8V6a3 3 0 0 1 6 0v2" />
                      </svg>
                    )}
                    {justAdded ? "Added" : "Add to Bag"}
                  </button>
                </>
              ) : (
                <span className="flex h-7 items-center rounded-full border border-white/40 bg-black/30 px-3 text-[10px] font-semibold text-white/80 shadow-md backdrop-blur-md">
                  Out of Stock
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5 px-1">
          {product.category && (
            <span className="w-fit rounded-full bg-sage-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sage-700">
              {product.category.name}
            </span>
          )}
          <Heading level={4} className="text-base transition-colors duration-200 group-hover:text-sage-700">
            {product.name}
          </Heading>
          <div className="mt-1">
            {percentOff !== null ? (
              <div className="flex items-center gap-2">
                <Text className="text-lg font-semibold text-charcoal-900">
                  {formatPrice(product.sale_price!)}
                </Text>
                <Text className="text-sm text-charcoal-400 line-through">
                  {formatPrice(product.base_price)}
                </Text>
              </div>
            ) : (
              <Text className="text-lg font-semibold text-charcoal-900">
                {formatPrice(product.base_price)}
              </Text>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
