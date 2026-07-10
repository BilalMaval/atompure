"use client";

import { useCallback, useRef, useState } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropModalProps {
  src: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

function getCroppedBlob(
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = Math.round(crop.width * scaleX);
  canvas.height = Math.round(crop.height * scaleY);

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas empty"))),
      "image/jpeg",
      0.92
    );
  });
}

export function ImageCropModal({ src, onConfirm, onCancel }: ImageCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 5,
    y: 5,
    width: 90,
    height: 90,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;
    setIsProcessing(true);
    try {
      const blob = await getCroppedBlob(imgRef.current, completedCrop);
      onConfirm(blob);
    } catch {
      setIsProcessing(false);
    }
  }, [completedCrop, onConfirm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex w-full max-w-3xl flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-charcoal-900">
            Crop Before / After Banner
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-charcoal-400 hover:text-charcoal-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-charcoal-500">
          Drag the handles on any side or corner to define exactly which area of
          the image shows in the banner. You can freely resize all four sides.
        </p>

        {/* Crop area — scrollable so tall images don't overflow */}
        <div className="max-h-[60vh] overflow-auto rounded-lg bg-charcoal-100">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            ruleOfThirds
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt="Crop preview"
              className="max-w-full"
              style={{ display: "block" }}
            />
          </ReactCrop>
        </div>

        {completedCrop && (
          <p className="text-[11px] text-charcoal-400">
            Crop size: {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)} px
            (scaled to natural image size on export)
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-beige-300 px-4 py-2 text-sm font-medium text-charcoal-700 hover:bg-beige-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!completedCrop || isProcessing}
            className="rounded-lg bg-sage-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sage-700 disabled:opacity-50"
          >
            {isProcessing ? "Processing…" : "Use This Crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
