import { notFound } from "next/navigation";
import { getAdminTicketById, getTicketReplies } from "@/lib/data/admin/tickets";
import { Heading, Text } from "@/components/ui/Typography";
import { TicketStatusSelect } from "@/components/admin/TicketStatusSelect";
import { TicketReplies } from "@/components/admin/TicketReplies";

export default async function AdminTicketDetailPage({ params }: { params: { id: string } }) {
  const ticket = await getAdminTicketById(params.id);
  if (!ticket) notFound();
  const replies = await getTicketReplies(ticket.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Heading level={1}>{ticket.subject}</Heading>
        <TicketStatusSelect ticketId={ticket.id} status={ticket.status} />
      </div>

      <Text>
        From <strong>{ticket.name}</strong> ({ticket.email})
      </Text>
      <Text className="text-xs text-charcoal-500">
        Submitted {new Date(ticket.created_at).toLocaleString()}
      </Text>

      <div className="rounded-2xl border border-beige-200 bg-cream-100 p-6">
        <Text>{ticket.message}</Text>
      </div>

      <div>
        <Heading level={3} className="mb-4">
          Replies
        </Heading>
        <TicketReplies ticketId={ticket.id} replies={replies} />
      </div>
    </div>
  );
}
