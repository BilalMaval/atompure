"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { updateBeforeAfterImage, updateBeforeAfterDisplay } from "@/app/actions/admin/products";
import { ImageCropModal } from "@/components/admin/ImageCropModal";

const POSITIONS = [
  { value: "top", label: "Top" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" },
];

export function BeforeAfterImageManager({
  productId,
  imageUrl,
  initialHeight = 420,
  initialPosition = "center",
}: {
  productId: string;
  imageUrl: string | null;
  initialHeight?: number;
  initialPosition?: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [height, setHeight] = useState(initialHeight);
  const [position, setPosition] = useState(initialPosition);

  // Crop modal state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>("");

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
    // Reset input so same file can be re-picked
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleRemove() {
    await updateBeforeAfterImage(productId, null);
    router.refresh();
  }

  async function handleSaveDisplay() {
    setIsSaving(true);
    const result = await updateBeforeAfterDisplay(productId, height, position);
    setIsSaving(false);
    if (!result.success) setError(result.error ?? "Failed to save display settings.");
    else router.refresh();
  }

  return (
    <>
      {/* Crop modal — mounts outside the form flow */}
      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <div className="flex flex-col gap-4">
        {/* Preview */}
        {imageUrl && (
          <div
            className="relative w-full overflow-hidden rounded-lg bg-beige-100"
            style={{ height: `${Math.round(height * 0.3)}px` }}
          >
            <Image
              src={imageUrl}
              alt="Before/after result"
              fill
              className="object-cover"
              style={{ objectPosition: position }}
              sizes="600px"
            />
            <span className="absolute bottom-1 right-2 text-[10px] text-white/70">
              Preview (scaled)
            </span>
          </div>
        )}

        {/* Upload */}
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
          After picking a file, a crop tool will open so you can select exactly which area to display.
        </p>

        {/* Display controls */}
        {imageUrl && (
          <div className="rounded-lg border border-beige-200 bg-beige-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-charcoal-500">
              Banner Display Settings
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-xs font-medium text-charcoal-700">
                  Banner Height: <span className="font-semibold">{height}px</span>
                </label>
                <input
                  type="range"
                  min={200}
                  max={800}
                  step={10}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-sage-600"
                />
                <div className="flex justify-between text-[10px] text-charcoal-400">
                  <span>200px</span>
                  <span>800px</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-charcoal-700">Vertical Position</label>
                <div className="flex gap-2">
                  {POSITIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPosition(p.value)}
                      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                        position === p.value
                          ? "border-sage-600 bg-sage-600 text-white"
                          : "border-beige-300 bg-white text-charcoal-700 hover:border-sage-400"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveDisplay}
                disabled={isSaving}
                className="rounded-md bg-sage-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sage-700 disabled:opacity-50"
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </>
  );
}
