"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { addProductImage, deleteProductImage, reorderProductImage } from "@/app/actions/admin/products";

interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
}

export function ImageManager({ productId, images }: { productId: string; images: ProductImage[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    const supabase = createClient();
    const path = `${productId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file);

    if (uploadError) {
      setError(uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path);
    const result = await addProductImage(productId, publicUrlData.publicUrl, file.name, sorted.length);

    setIsUploading(false);
    if (!result.success) {
      setError(result.error ?? "Upload failed.");
      return;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleDelete(imageId: string) {
    await deleteProductImage(imageId, productId);
    router.refresh();
  }

  async function handleMove(imageId: string, direction: -1 | 1) {
    const index = sorted.findIndex((img) => img.id === imageId);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;

    await reorderProductImage(imageId, productId, swapWith.sort_order);
    await reorderProductImage(swapWith.id, productId, sorted[index].sort_order);
    router.refresh();
  }

  async function handleSetMain(imageId: string) {
    const index = sorted.findIndex((img) => img.id === imageId);
    if (index <= 0) return;
    const first = sorted[0];

    await reorderProductImage(imageId, productId, first.sort_order);
    await reorderProductImage(first.id, productId, sorted[index].sort_order);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        {sorted.map((image, index) => (
          <div key={image.id} className="flex flex-col gap-2">
            <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-beige-100">
              <Image src={image.url} alt={image.alt_text ?? ""} fill className="object-cover" sizes="128px" />
              {index === 0 && (
                <span className="absolute left-1 top-1 rounded bg-sage-600 px-1.5 py-0.5 text-[10px] font-medium text-cream-50">
                  Main
                </span>
              )}
            </div>
            <div className="flex justify-between text-xs">
              <button
                disabled={index === 0}
                onClick={() => handleMove(image.id, -1)}
                className="disabled:opacity-30"
              >
                ←
              </button>
              <button onClick={() => handleDelete(image.id)} className="text-red-600">
                Delete
              </button>
              <button
                disabled={index === sorted.length - 1}
                onClick={() => handleMove(image.id, 1)}
                className="disabled:opacity-30"
              >
                →
              </button>
            </div>
            {index !== 0 && (
              <button
                onClick={() => handleSetMain(image.id)}
                className="text-xs text-sage-700 underline"
              >
                Set as main
              </button>
            )}
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={isUploading}
        className="text-sm"
      />
      {isUploading && <p className="text-xs text-charcoal-500">Uploading...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
