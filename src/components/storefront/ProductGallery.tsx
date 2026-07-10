"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { clsx } from "@/lib/utils";
import { ZoomImage } from "@/components/storefront/ZoomImage";

interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
}

export function ProductGallery({
  images,
  productName,
  badge,
  variantImageUrl,
}: {
  images: ProductImage[];
  productName: string;
  badge?: React.ReactNode;
  variantImageUrl?: string | null;
}) {
  // When a variant image is injected, prepend it as a synthetic first entry.
  const displayImages: ProductImage[] = variantImageUrl
    ? [{ id: "__variant__", url: variantImageUrl, alt_text: productName }, ...images]
    : images;

  const [activeIndex, setActiveIndex] = useState(0);

  // Snap to index 0 whenever the variant image changes.
  useEffect(() => {
    setActiveIndex(0);
  }, [variantImageUrl]);

  const active = displayImages[activeIndex] ?? displayImages[0];

  if (!active) {
    return (
      <div className="relative flex aspect-square h-full w-full items-center justify-center rounded-2xl bg-beige-100 text-sage-400">
        {badge && <div className="absolute left-3 top-3 z-10">{badge}</div>}
        <span className="font-display text-lg">ATOM PURE</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
      {/* Thumbnails — wrapping grid below on mobile, vertical sidebar on LEFT on sm+ */}
      {displayImages.length > 1 && (
        <div className="order-2 flex flex-row flex-wrap gap-2 sm:order-1 sm:flex-col sm:flex-nowrap">
          {displayImages.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={clsx(
                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-beige-100 ring-2 transition-colors sm:h-20 sm:w-20",
                index === activeIndex ? "ring-sage-600" : "ring-transparent"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt_text ?? productName}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
      {/* Main image */}
      <div className="relative order-1 flex-1 sm:order-2">
        {badge && <div className="absolute left-3 top-3 z-10">{badge}</div>}
        <ZoomImage src={active.url} alt={active.alt_text ?? productName} />
      </div>
    </div>
  );
}
