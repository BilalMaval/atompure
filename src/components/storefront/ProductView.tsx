"use client";

import { useState } from "react";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { StickyAddToCartWrapper } from "@/components/storefront/StickyAddToCartWrapper";
import type { ProductDetail } from "@/lib/data/products";

interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
}

/**
 * Client wrapper that owns the variant-image state shared between the gallery
 * (left column) and the add-to-cart form (right column).
 *
 * `galleryOverlay` — absolute-positioned node over the gallery (e.g. wishlist button).
 * `badge`          — overlay badge on the main gallery image (e.g. "Free Delivery").
 * `aboveForm`      — content rendered in the right column above the add-to-cart form.
 * `belowForm`      — content rendered in the right column below the add-to-cart form.
 */
export function ProductView({
  product,
  images,
  badge,
  galleryOverlay,
  aboveForm,
  belowForm,
}: {
  product: ProductDetail;
  images: ProductImage[];
  badge?: React.ReactNode;
  galleryOverlay?: React.ReactNode;
  aboveForm?: React.ReactNode;
  belowForm?: React.ReactNode;
}) {
  const [variantImageUrl, setVariantImageUrl] = useState<string | null>(null);

  return (
    <>
      <div className="relative flex flex-col gap-4">
        {galleryOverlay && (
          <div className="absolute right-3 top-3 z-10">{galleryOverlay}</div>
        )}
        <ProductGallery
          images={images}
          productName={product.name}
          badge={badge}
          variantImageUrl={variantImageUrl}
        />
      </div>

      <div className="flex flex-col gap-6">
        {aboveForm}
        <StickyAddToCartWrapper
          product={product}
          onVariantImageChange={setVariantImageUrl}
        />
        {belowForm}
      </div>
    </>
  );
}
