"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { setProductVariationGroups } from "@/app/actions/admin/variations";
import type { AdminVariationGroup } from "@/lib/data/admin/variations";

export function ProductVariationGroupsManager({
  productId,
  allGroups,
  assignedGroupIds,
}: {
  productId: string;
  allGroups: AdminVariationGroup[];
  assignedGroupIds: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(assignedGroupIds);
  const [saving, setSaving] = useState(false);

  function toggle(groupId: string) {
    setSelected((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...selected];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSelected(next);
  }

  async function handleSave() {
    setSaving(true);
    await setProductVariationGroups(productId, selected);
    setSaving(false);
    router.refresh();
  }

  const groupsById = new Map(allGroups.map((g) => [g.id, g]));

  if (allGroups.length === 0) {
    return (
      <Text className="text-sm text-charcoal-500">
        No variation groups exist yet. Create some in{" "}
        <a href="/admin/variations" className="text-sage-700 underline">
          Variations
        </a>{" "}
        first, then come back here to assign them to this product.
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {allGroups.map((group) => (
          <label
            key={group.id}
            className="flex items-center gap-2 rounded-full border border-beige-300 px-3 py-1.5 text-sm"
          >
            <input
              type="checkbox"
              checked={selected.includes(group.id)}
              onChange={() => toggle(group.id)}
            />
            {group.name}
          </label>
        ))}
      </div>

      {selected.length > 0 && (
        <div>
          <Text className="mb-1 text-xs font-medium uppercase text-charcoal-500">
            Order shown on product page
          </Text>
          <ul className="flex flex-col gap-1">
            {selected.map((groupId, index) => (
              <li key={groupId} className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="text-xs text-charcoal-400 disabled:opacity-30"
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === selected.length - 1}
                  className="text-xs text-charcoal-400 disabled:opacity-30"
                  aria-label="Move down"
                >
                  ▼
                </button>
                <span>{groupsById.get(groupId)?.name ?? groupId}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button type="button" size="sm" className="w-fit" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Assigned Groups"}
      </Button>
    </div>
  );
}
