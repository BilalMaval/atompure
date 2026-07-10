"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { updateBeforeAfterImage } from "@/app/actions/admin/products";
import { ImageCropModal } from "@/components/admin/ImageCropModal";

export function BeforeAfterImageManager({
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
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>("");

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFileName(file.name);
    setCropSrc(URL.createObjectURL(file));
    e.target.value = "";
  }

  async function handleCropConfirm(blob: Blob) {
    setCropSrc(null);
    setError(null);
    setIsUploading(true);

    const supabase = createClient();
    const path = `${productId}/before-after-${Date.now()}-${pendingFileName}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, blob, { contentType: "image/jpeg" });

    if (uploadError) {
      setError(uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path);
    const result = await updateBeforeAfterImage(productId, publicUrlData.publicUrl);

    setIsUploading(false);
    if (!result.success) {
      setError(result.error ?? "Upload failed.");
      return;
    }
    router.refresh();
  }

  function handleCropCancel() {
    setCropSrc(null);
  }

  async function handleRemove() {
    await updateBeforeAfterImage(productId, null);
    router.refresh();
  }

  return (
    <>
      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <div className="flex flex-col gap-3">
        {imageUrl && (
          <div className="relative h-32 w-full overflow-hidden rounded-lg bg-beige-100">
            <Image src={imageUrl} alt="Before/after result" fill className="object-cover" sizes="600px" />
          </div>
        )}

        <div className="flex items-center gap-3">
          <label className="cursor-pointer rounded-md border border-beige-300 bg-white px-3 py-1.5 text-xs font-medium text-charcoal-700 hover:border-sage-400">
            {isUploading ? "Uploading…" : imageUrl ? "Replace Image" : "Upload Image"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFilePick}
              disabled={isUploading}
              className="sr-only"
            />
          </label>
          {imageUrl && (
            <button type="button" onClick={handleRemove} className="text-xs text-red-600 hover:underline">
              Remove
            </button>
          )}
        </div>

        <p className="text-[11px] text-charcoal-400">
          A crop tool will open after picking a file — select exactly what area to show in the banner.
        </p>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </>
  );
}
