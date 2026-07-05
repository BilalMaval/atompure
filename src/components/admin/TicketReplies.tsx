"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTicketReply } from "@/app/actions/admin/tickets";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";

interface Reply {
  id: string;
  body: string;
  created_at: string;
}

export function TicketReplies({ ticketId, replies }: { ticketId: string; replies: Reply[] }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const result = await addTicketReply(ticketId, body);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Could not send reply.");
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {replies.length > 0 && (
        <ul className="flex flex-col gap-3">
          {replies.map((reply) => (
            <li key={reply.id} className="rounded-xl border border-beige-200 bg-cream-50 p-4">
              <Text>{reply.body}</Text>
              <Text className="mt-2 text-xs text-charcoal-400">
                {new Date(reply.created_at).toLocaleString()}
              </Text>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a reply..."
          className="min-h-24 rounded-lg border border-beige-300 bg-cream-50 p-4 text-sm"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? "Sending..." : "Send Reply"}
        </Button>
        <Text className="text-xs text-charcoal-400">
          Note: the customer is not emailed automatically yet — outbound email needs a provider
          to be configured.
        </Text>
      </form>
    </div>
  );
}
