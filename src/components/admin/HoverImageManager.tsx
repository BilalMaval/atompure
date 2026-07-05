"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { updateHoverImage } from "@/app/actions/admin/products";

export function HoverImageManager({
  productId,
  imageUrl,
}: {
  productId: string;
  imageUrl: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    const supabase = createClient();
    const path = `${productId}/hover-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file);

    if (uploadError) {
      setError(uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path);
    const result = await updateHoverImage(productId, publicUrlData.publicUrl);

    setIsUploading(false);
    if (!result.success) {
      setError(result.error ?? "Upload failed.");
      return;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleRemove() {
    await updateHoverImage(productId, null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {imageUrl && (
        <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-beige-100">
          <Image src={imageUrl} alt="Hover image" fill className="object-cover" sizes="128px" />
        </div>
      )}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={isUploading}
          className="text-sm"
        />
        {imageUrl && (
          <button type="button" onClick={handleRemove} className="text-xs text-red-600">
            Remove
          </button>
        )}
      </div>
      {isUploading && <p className="text-xs text-charcoal-500">Uploading...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
