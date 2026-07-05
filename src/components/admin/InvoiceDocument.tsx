import { formatPrice } from "@/lib/format";
import type { AdminOrderDetail } from "@/lib/data/admin/orders";

export function InvoiceDocument({ order }: { order: AdminOrderDetail }) {
  return (
    <div className="mx-auto max-w-2xl bg-white p-10 text-charcoal-900 print:break-after-page print:p-0">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl">ATOM PURE</h1>
        <div className="text-right text-sm">
          <p className="font-medium">Invoice {order.order_number}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-1 text-sm font-medium uppercase text-charcoal-500">Bill To</h2>
        <p>{order.shipping_full_name}</p>
        <p>{order.shipping_phone}</p>
        <p>
          {order.shipping_line1}
          {order.shipping_line2 ? `, ${order.shipping_line2}` : ""}
        </p>
        <p>
          {order.shipping_city}
          {order.shipping_province ? `, ${order.shipping_province}` : ""} {order.shipping_postal_code ?? ""}
        </p>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-charcoal-200">
            <th className="py-2">Item</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Price</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items.map((item) => (
            <tr key={item.id} className="border-b border-charcoal-100">
              <td className="py-2">
                {item.product_variant?.product?.name} ({item.product_variant?.name})
              </td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">{formatPrice(item.unit_price)}</td>
              <td className="py-2 text-right">{formatPrice(item.unit_price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-48 text-right">
          <p className="font-medium">Total: {formatPrice(order.total)}</p>
          <p className="mt-1 text-xs uppercase text-charcoal-500">
            Payment: {order.payment_method}
          </p>
        </div>
      </div>
    </div>
  );
}
