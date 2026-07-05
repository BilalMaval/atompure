"use client";

import { useRouter } from "next/navigation";
import { updateReviewStatus, deleteReview } from "@/app/actions/admin/reviews";

export function ReviewActions({ reviewId, status }: { reviewId: string; status: string }) {
  const router = useRouter();

  async function handleApprove() {
    await updateReviewStatus(reviewId, "approved");
    router.refresh();
  }

  async function handleReject() {
    await updateReviewStatus(reviewId, "rejected");
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm("Delete this review?")) return;
    await deleteReview(reviewId);
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-3 text-sm">
      {status !== "approved" && (
        <button onClick={handleApprove} className="text-sage-700 hover:underline">
          Approve
        </button>
      )}
      {status !== "rejected" && (
        <button onClick={handleReject} className="text-charcoal-500 hover:underline">
          Reject
        </button>
      )}
      <button onClick={handleDelete} className="text-red-600 hover:underline">
        Delete
      </button>
    </div>
  );
}
