import Link from "next/link";
import { getAdminTickets } from "@/lib/data/admin/tickets";
import { Heading } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { AdminTable } from "@/components/admin/AdminTable";
import { clsx } from "@/lib/utils";

const STATUSES = ["open", "in_progress", "resolved"];

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const tickets = await getAdminTickets(searchParams.status);

  return (
    <div className="flex flex-col gap-6">
      <Heading level={1}>Support Tickets</Heading>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/support-tickets"
          className={clsx(
            "rounded-full border px-4 py-1.5 text-sm",
            !searchParams.status
              ? "border-sage-600 bg-sage-600 text-cream-50"
              : "border-beige-300 text-charcoal-600"
          )}
        >
          All
        </Link>
        {STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/support-tickets?status=${status}`}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-sm capitalize",
              searchParams.status === status
                ? "border-sage-600 bg-sage-600 text-cream-50"
                : "border-beige-300 text-charcoal-600"
            )}
          >
            {status.replace("_", " ")}
          </Link>
        ))}
      </div>

      <AdminTable headers={["Name", "Email", "Subject", "Status", "Date", ""]}>
        {tickets.map((ticket) => (
          <tr key={ticket.id}>
            <td className="px-4 py-3">{ticket.name}</td>
            <td className="px-4 py-3">{ticket.email}</td>
            <td className="px-4 py-3">{ticket.subject}</td>
            <td className="px-4 py-3">
              <Badge>{ticket.status.replace("_", " ")}</Badge>
            </td>
            <td className="px-4 py-3">{new Date(ticket.created_at).toLocaleDateString()}</td>
            <td className="px-4 py-3 text-right">
              <Link href={`/admin/support-tickets/${ticket.id}`} className="text-sage-700 hover:underline">
                View
              </Link>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
