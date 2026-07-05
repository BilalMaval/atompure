"use client";

import { useRouter } from "next/navigation";
import { updateOrderStatus, updatePaymentStatus } from "@/app/actions/admin/orders";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

export function OrderStatusControls({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
}) {
  const router = useRouter();

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await updateOrderStatus(orderId, e.target.value as (typeof ORDER_STATUSES)[number]);
    router.refresh();
  }

  async function handlePaymentStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await updatePaymentStatus(orderId, e.target.value as (typeof PAYMENT_STATUSES)[number]);
    router.refresh();
  }

  return (
    <div className="flex gap-4">
      <div>
        <label className="mb-1 block text-xs text-charcoal-500">Order Status</label>
        <select
          defaultValue={status}
          onChange={handleStatusChange}
          className="h-10 rounded-lg border border-beige-300 bg-cream-50 px-3 text-sm capitalize"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-charcoal-500">Payment Status</label>
        <select
          defaultValue={paymentStatus}
          onChange={handlePaymentStatusChange}
          className="h-10 rounded-lg border border-beige-300 bg-cream-50 px-3 text-sm capitalize"
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
