"use client";

import { useRouter } from "next/navigation";
import { updateTicketStatus } from "@/app/actions/admin/tickets";

const STATUSES = ["open", "in_progress", "resolved"] as const;

export function TicketStatusSelect({ ticketId, status }: { ticketId: string; status: string }) {
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await updateTicketStatus(ticketId, e.target.value as (typeof STATUSES)[number]);
    router.refresh();
  }

  return (
    <select
      defaultValue={status}
      onChange={handleChange}
      className="h-10 rounded-lg border border-beige-300 bg-cream-50 px-3 text-sm capitalize"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
