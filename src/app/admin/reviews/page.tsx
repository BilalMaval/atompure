import Link from "next/link";
import { getAdminReviews } from "@/lib/data/admin/reviews";
import { Heading } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { AdminTable } from "@/components/admin/AdminTable";
import { ReviewActions } from "@/components/admin/ReviewActions";
import { clsx } from "@/lib/utils";

const STATUSES = ["pending", "approved", "rejected"];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const reviews = await getAdminReviews(searchParams.status);

  return (
    <div className="flex flex-col gap-6">
      <Heading level={1}>Reviews</Heading>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/reviews"
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
            href={`/admin/reviews?status=${status}`}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-sm capitalize",
              searchParams.status === status
                ? "border-sage-600 bg-sage-600 text-cream-50"
                : "border-beige-300 text-charcoal-600"
            )}
          >
            {status}
          </Link>
        ))}
      </div>

      <AdminTable headers={["Product", "Rating", "Review", "Status", ""]}>
        {reviews.map((review) => (
          <tr key={review.id}>
            <td className="px-4 py-3">
              {(review.product as unknown as { name: string } | null)?.name ?? "—"}
            </td>
            <td className="px-4 py-3">{"★".repeat(review.rating)}</td>
            <td className="max-w-xs px-4 py-3 truncate">{review.body}</td>
            <td className="px-4 py-3">
              <Badge>{review.status}</Badge>
            </td>
            <td className="px-4 py-3">
              <ReviewActions reviewId={review.id} status={review.status} />
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
