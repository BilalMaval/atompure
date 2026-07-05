"use client";

import Image from "next/image";
import type { ResultImage } from "@/lib/data/homepage";

export function ResultsGallery({ images }: { images: ResultImage[] }) {
  if (images.length === 0) return null;

  const loop = [...images, ...images];

  return (
    <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <div className="flex w-max animate-marquee-slow gap-4 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {loop.map((image, i) => (
          <div
            key={`${image.id}-${i}`}
            className="relative h-44 w-44 flex-shrink-0 overflow-hidden rounded-2xl bg-beige-100 sm:h-56 sm:w-56"
          >
            <Image
              src={image.image_url}
              alt={image.alt_text ?? "Real customer result"}
              fill
              sizes="224px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
