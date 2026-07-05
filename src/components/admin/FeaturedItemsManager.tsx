"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { clsx } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface FeaturedItemOption {
  id: string;
  label: string;
  sublabel?: string;
  imageUrl?: string | null;
}

export function FeaturedItemsManager({
  allItems,
  initialFeaturedIds,
  onSave,
}: {
  allItems: FeaturedItemOption[];
  initialFeaturedIds: string[];
  onSave: (orderedIds: string[]) => Promise<{ success: boolean; error?: string }>;
}) {
  const featuredSet = new Set(initialFeaturedIds);
  const initialOrder = [
    ...initialFeaturedIds.filter((id) => allItems.some((item) => item.id === id)),
    ...allItems.filter((item) => !featuredSet.has(item.id)).map((item) => item.id),
  ];

  const [order, setOrder] = useState<string[]>(initialOrder);
  const [selected, setSelected] = useState<Set<string>>(new Set(initialFeaturedIds));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  const itemsById = new Map(allItems.map((item) => [item.id, item]));

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

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragIndex.current = null;
  }

  function handleDragEnd() {
    dragIndex.current = null;
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    const orderedFeaturedIds = order.filter((id) => selected.has(id));
    const result = await onSave(orderedFeaturedIds);
    setIsSaving(false);
    setMessage(result.success ? "Saved." : result.error ?? "Something went wrong.");
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-charcoal-500">
        Check the items to show on the homepage, and drag rows to set their display order.
      </p>
      <ul className="flex flex-col gap-2">
        {order.map((id, index) => {
          const item = itemsById.get(id);
          if (!item) return null;
          const isSelected = selected.has(id);
          return (
            <li
              key={id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              className={clsx(
                "flex cursor-move items-center gap-3 rounded-lg border p-3 transition-colors",
                isSelected ? "border-sage-300 bg-sage-50" : "border-beige-200 bg-cream-50"
              )}
            >
              <span aria-hidden className="text-charcoal-400">
                ☰
              </span>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelected(id)}
                className="h-4 w-4"
              />
              {item.imageUrl ? (
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-beige-100">
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    sizes="40px"
                    draggable={false}
                    className="pointer-events-none object-cover"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 flex-shrink-0 rounded bg-beige-100" />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-charcoal-800">{item.label}</span>
                {item.sublabel && <span className="text-xs text-charcoal-400">{item.sublabel}</span>}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSave} disabled={isSaving} className="w-fit">
          {isSaving ? "Saving..." : "Save Order"}
        </Button>
        {message && <span className="text-sm text-charcoal-500">{message}</span>}
      </div>
    </div>
  );
}
