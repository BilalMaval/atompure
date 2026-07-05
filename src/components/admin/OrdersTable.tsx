"use client";

import { useState } from "react";
import Link from "next/link";
import { updateOrderStatus, updatePaymentStatus } from "@/app/actions/admin/orders";
import { formatPrice } from "@/lib/format";
import { clsx } from "@/lib/utils";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

export interface AdminOrderRow {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
  guest_email: string | null;
  created_at: string;
}

export function OrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  const [rows, setRows] = useState(orders);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))));
  }

  async function handleStatusChange(orderId: string, status: string) {
    setSavingId(orderId);
    setRows((prev) => prev.map((r) => (r.id === orderId ? { ...r, status } : r)));
    await updateOrderStatus(orderId, status as (typeof ORDER_STATUSES)[number]);
    setSavingId(null);
  }

  async function handlePaymentChange(orderId: string, paymentStatus: string) {
    setSavingId(orderId);
    setRows((prev) => prev.map((r) => (r.id === orderId ? { ...r, payment_status: paymentStatus } : r)));
    await updatePaymentStatus(orderId, paymentStatus as (typeof PAYMENT_STATUSES)[number]);
    setSavingId(null);
  }

  function downloadSelectedInvoices() {
    const ids = Array.from(selected);
    ids.forEach((id, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = `/admin/orders/${id}/invoice/pdf`;
        link.download = "";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 300);
    });
  }

  function printSelectedInvoices() {
    const ids = Array.from(selected);
    window.open(`/admin/orders/invoices/print?ids=${ids.join(",")}`, "_blank");
  }

  return (
    <div className="flex flex-col gap-3">
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-sage-300 bg-sage-50 px-4 py-2">
          <span className="text-sm text-charcoal-700">{selected.size} selected</span>
          <button
            type="button"
            onClick={downloadSelectedInvoices}
            className="text-sm font-medium text-sage-700 hover:underline"
          >
            Download Invoices
          </button>
          <button
            type="button"
            onClick={printSelectedInvoices}
            className="text-sm font-medium text-sage-700 hover:underline"
          >
            Print Invoices
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-beige-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-100 text-charcoal-600">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={rows.length > 0 && selected.size === rows.length}
                  onChange={toggleSelectAll}
                />
              </th>
              {["Order", "Customer", "Total", "Status", "Payment", "Date"].map((header) => (
                <th key={header} className="px-4 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-200">
            {rows.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(order.id)}
                    onChange={() => toggleSelected(order.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-sage-700 hover:underline">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3">{order.guest_email ?? "—"}</td>
                <td className="px-4 py-3">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    disabled={savingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={clsx(
                      "rounded-full border border-beige-300 bg-cream-50 px-2 py-1 text-xs capitalize",
                      savingId === order.id && "opacity-50"
                    )}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={order.payment_status}
                    disabled={savingId === order.id}
                    onChange={(e) => handlePaymentChange(order.id, e.target.value)}
                    className={clsx(
                      "rounded-full border border-beige-300 bg-cream-50 px-2 py-1 text-xs capitalize",
                      savingId === order.id && "opacity-50"
                    )}
                  >
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
