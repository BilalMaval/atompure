"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { clsx } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  addResultImage,
  deleteResultImage,
  reorderResultImages,
  toggleResultActive,
} from "@/app/actions/admin/homepage";
import type { ResultImageAdmin } from "@/lib/data/admin/homepage";

export function ResultsGalleryManager({ images }: { images: ResultImageAdmin[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState(images.map((img) => img.id));
  const imageIdsKey = images.map((img) => img.id).join(",");

  // `images` is a fresh prop from the server after every router.refresh()
  // (upload/delete/toggle) — re-sync local order whenever the actual set
  // of rows changes, since useState's initial value only applies on mount.
  useEffect(() => {
    setOrder(images.map((img) => img.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageIdsKey]);

  const byId = new Map(images.map((img) => [img.id, img]));

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    const supabase = createClient();
    const path = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("results-gallery")
      .upload(path, file);

    if (uploadError) {
      setError(uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("results-gallery").getPublicUrl(path);
    const result = await addResultImage(publicUrlData.publicUrl, file.name, images.length);

    setIsUploading(false);
    if (!result.success) {
      setError(result.error ?? "Upload failed.");
      return;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteResultImage(id);
    router.refresh();
  }

  async function handleToggle(id: string, isActive: boolean) {
    await toggleResultActive(id, isActive);
    router.refresh();
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
    // Firefox requires data to be set for the drag to actually start.
    e.dataTransfer.setData("text/plain", String(index));
  }

  // Reorder once per row entered, not on every dragover tick — reordering
  // continuously on dragover thrashes the list under the cursor and can
  // make the drop target disappear out from under the pointer.
  function handleDragEnter(index: number) {
    if (dragIndex.current === null || dragIndex.current === index) return;
    const fromIndex = dragIndex.current;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent) {
    // Required so the browser allows dropping here at all.
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (dragIndex.current === null) return;
    dragIndex.current = null;
    await reorderResultImages(order);
    router.refresh();
  }

  function handleDragEnd() {
    dragIndex.current = null;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-charcoal-500">
        Drag to reorder. Toggle to show/hide on the homepage without deleting.
      </p>
      <ul className="flex flex-wrap gap-4">
        {order.map((id, index) => {
          const image = byId.get(id);
          if (!image) return null;
          return (
            <li
              key={id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              className="flex w-32 cursor-move flex-col gap-2"
            >
              <div
                className={clsx(
                  "relative aspect-square overflow-hidden rounded-lg bg-beige-100",
                  !image.is_active && "opacity-40"
                )}
              >
                <Image
                  src={image.image_url}
                  alt={image.alt_text ?? ""}
                  fill
                  sizes="128px"
                  draggable={false}
                  className="pointer-events-none object-cover"
                />
              </div>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={image.is_active}
                  onChange={(e) => handleToggle(id, e.target.checked)}
                />
                Active
              </label>
              <button type="button" onClick={() => handleDelete(id)} className="text-xs text-red-600">
                Delete
              </button>
            </li>
          );
        })}
      </ul>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={isUploading}
        className="text-sm"
      />
      <p className="text-xs text-charcoal-400">Upload 1:1 (square) images for best results.</p>
      {isUploading && <p className="text-xs text-charcoal-500">Uploading...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
