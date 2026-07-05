"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import {
  createVariationGroup,
  updateVariationGroup,
  deleteVariationGroup,
  reorderVariationGroups,
  createVariationValue,
  updateVariationValue,
  deleteVariationValue,
  reorderVariationValues,
} from "@/app/actions/admin/variations";
import type { AdminVariationGroup } from "@/lib/data/admin/variations";

export function VariationGroupsManager({ groups }: { groups: AdminVariationGroup[] }) {
  const router = useRouter();
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupLayout, setNewGroupLayout] = useState<"horizontal" | "vertical">("horizontal");
  const [error, setError] = useState<string | null>(null);

  async function handleCreateGroup() {
    if (!newGroupName.trim()) return;
    setError(null);
    const result = await createVariationGroup({ name: newGroupName.trim(), layout: newGroupLayout });
    if (!result.success) {
      setError(result.error ?? "Could not create group.");
      return;
    }
    setNewGroupName("");
    setNewGroupLayout("horizontal");
    router.refresh();
  }

  async function moveGroup(index: number, direction: -1 | 1) {
    const next = [...groups];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await reorderVariationGroups(next.map((g) => g.id));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-beige-200 p-4">
        <Text className="mb-3 font-medium text-charcoal-800">New Variation Group</Text>
        <div className="flex flex-wrap items-end gap-3">
          <Input
            placeholder="Group name (e.g. Size, Color, Weight)"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={newGroupLayout}
            onChange={(e) => setNewGroupLayout(e.target.value as "horizontal" | "vertical")}
            className="h-11 rounded-lg border border-beige-300 bg-cream-50 px-4 text-sm"
          >
            <option value="horizontal">Horizontal (pills in a row)</option>
            <option value="vertical">Vertical (stacked list)</option>
          </select>
          <Button type="button" onClick={handleCreateGroup}>
            Add Group
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      {groups.length === 0 ? (
        <Text className="text-sm text-charcoal-500">
          No variation groups yet. Create one above — e.g. &ldquo;Size&rdquo; with values &ldquo;Small&rdquo;, &ldquo;Medium&rdquo;,
          &ldquo;Large&rdquo;.
        </Text>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group, index) => (
            <GroupCard
              key={group.id}
              group={group}
              onMoveUp={index > 0 ? () => moveGroup(index, -1) : undefined}
              onMoveDown={index < groups.length - 1 ? () => moveGroup(index, 1) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupCard({
  group,
  onMoveUp,
  onMoveDown,
}: {
  group: AdminVariationGroup;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(group.name);
  const [layout, setLayout] = useState(group.layout);
  const [newValue, setNewValue] = useState("");
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [editingValueText, setEditingValueText] = useState("");

  async function handleSaveGroup() {
    if (!name.trim()) return;
    await updateVariationGroup(group.id, { name: name.trim(), layout });
    router.refresh();
  }

  async function handleDeleteGroup() {
    if (!window.confirm(`Delete "${group.name}"? This removes it from any products using it.`)) return;
    await deleteVariationGroup(group.id);
    router.refresh();
  }

  async function handleAddValue() {
    if (!newValue.trim()) return;
    await createVariationValue(group.id, { value: newValue.trim() });
    setNewValue("");
    router.refresh();
  }

  async function handleSaveValue(valueId: string) {
    if (!editingValueText.trim()) return;
    await updateVariationValue(valueId, { value: editingValueText.trim() });
    setEditingValueId(null);
    router.refresh();
  }

  async function handleDeleteValue(valueId: string) {
    await deleteVariationValue(valueId);
    router.refresh();
  }

  async function moveValue(index: number, direction: -1 | 1) {
    const next = [...group.variation_values];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await reorderVariationValues(next.map((v) => v.id));
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-beige-200 p-4">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!onMoveUp}
            className="text-xs text-charcoal-400 disabled:opacity-30"
            aria-label="Move group up"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!onMoveDown}
            className="text-xs text-charcoal-400 disabled:opacity-30"
            aria-label="Move group down"
          >
            ▼
          </button>
        </div>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
        <select
          value={layout}
          onChange={(e) => setLayout(e.target.value as "horizontal" | "vertical")}
          className="h-11 rounded-lg border border-beige-300 bg-cream-50 px-4 text-sm"
        >
          <option value="horizontal">Horizontal (pills in a row)</option>
          <option value="vertical">Vertical (stacked list)</option>
        </select>
        <Button type="button" size="sm" onClick={handleSaveGroup}>
          Save
        </Button>
        <button type="button" onClick={handleDeleteGroup} className="text-sm text-red-600 hover:underline">
          Delete Group
        </button>
      </div>

      <Text className="mb-2 text-xs font-medium uppercase text-charcoal-500">Values</Text>
      <ul className="mb-3 flex flex-col gap-1">
        {group.variation_values.map((value, index) => (
          <li key={value.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => moveValue(index, -1)}
              disabled={index === 0}
              className="text-xs text-charcoal-400 disabled:opacity-30"
              aria-label="Move value up"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => moveValue(index, 1)}
              disabled={index === group.variation_values.length - 1}
              className="text-xs text-charcoal-400 disabled:opacity-30"
              aria-label="Move value down"
            >
              ▼
            </button>
            {editingValueId === value.id ? (
              <>
                <Input
                  value={editingValueText}
                  onChange={(e) => setEditingValueText(e.target.value)}
                  className="h-9 max-w-[180px]"
                />
                <button
                  type="button"
                  onClick={() => handleSaveValue(value.id)}
                  className="text-xs text-sage-700 hover:underline"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingValueId(null)}
                  className="text-xs text-charcoal-500 hover:underline"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="text-sm">{value.value}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingValueId(value.id);
                    setEditingValueText(value.value);
                  }}
                  className="text-xs text-sage-700 hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteValue(value.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
        {group.variation_values.length === 0 && (
          <li>
            <Text className="text-xs text-charcoal-400">No values yet.</Text>
          </li>
        )}
      </ul>

      <div className="flex items-end gap-2">
        <Input
          placeholder="Add a value (e.g. Small)"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="h-9 max-w-[220px]"
        />
        <button type="button" onClick={handleAddValue} className="text-sm text-sage-700 hover:underline">
          Add Value
        </button>
      </div>
    </div>
  );
}
