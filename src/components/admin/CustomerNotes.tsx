"use client";

import { useState } from "react";
import { updateCustomerNotes } from "@/app/actions/admin/customers";
import { Button } from "@/components/ui/Button";

export function CustomerNotes({ customerId, initialNotes }: { customerId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setSaved(false);
    await updateCustomerNotes(customerId, notes);
    setIsSaving(false);
    setSaved(true);
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Internal notes about this customer..."
        className="min-h-24 rounded-lg border border-beige-300 bg-cream-50 p-4 text-sm"
      />
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} disabled={isSaving} className="w-fit">
          {isSaving ? "Saving..." : "Save Notes"}
        </Button>
        {saved && <span className="text-xs text-sage-700">Saved</span>}
      </div>
    </div>
  );
}
