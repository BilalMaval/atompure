import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAdminOrderById } from "@/lib/data/admin/orders";
import { Heading, Text } from "@/components/ui/Typography";
import { OrderStatusControls } from "@/components/admin/OrderStatusControls";
import { formatPrice } from "@/lib/format";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getAdminOrderById(params.id);
  if (!order) notFound();

  const customerEmail = order.guest_email ?? order.customer?.email ?? null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <Heading level={1}>{order.order_number}</Heading>
        <div className="flex gap-4">
          <Link href={`/admin/orders/${order.id}/invoice`} className="text-sm text-sage-700 underline">
            Print Invoice
          </Link>
          <a href={`/admin/orders/${order.id}/invoice/pdf`} className="text-sm text-sage-700 underline">
            Download PDF
          </a>
        </div>
      </div>

      <OrderStatusControls
        orderId={order.id}
        status={order.status}
        paymentStatus={order.payment_status}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <Heading level={3} className="mb-4">Items</Heading>
          <ul className="flex flex-col gap-3">
            {order.order_items.map((item) => {
              const productName = item.product_name ?? item.product_variant?.product?.name ?? "Product removed";
              const variantName = item.variant_name ?? item.product_variant?.name ?? "";
              return (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  {item.image_url && (
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-beige-100">
                      <Image src={item.image_url} alt={productName} width={40} height={40} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex flex-1 justify-between gap-2">
                    <span>{productName}{variantName ? ` (${variantName})` : ""} &times; {item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-col gap-2 border-t border-beige-200 pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount_total > 0 && (
              <div className="flex justify-between text-sage-700">
                <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                <span>-{formatPrice(order.discount_total)}</span>
              </div>
            )}
            {order.shipping_total > 0 && (
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping_total)}</span>
              </div>
            )}
            {order.tax_total > 0 && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatPrice(order.tax_total)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-beige-200 pt-2 font-medium">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div>
          <Heading level={3} className="mb-4">Customer</Heading>
          {order.customer && (
            <Text className="font-medium">{order.customer.full_name ?? "—"}</Text>
          )}
          {customerEmail && <Text className="text-sm text-charcoal-500">{customerEmail}</Text>}
          {order.customer?.phone && <Text className="text-sm text-charcoal-500">{order.customer.phone}</Text>}

          <Heading level={4} className="mt-6 mb-2">Shipping Address</Heading>
          <Text>{order.shipping_full_name}</Text>
          <Text>{order.shipping_phone}</Text>
          <Text>
            {order.shipping_line1}
            {order.shipping_line2 ? `, ${order.shipping_line2}` : ""}
          </Text>
          <Text>
            {order.shipping_city}
            {order.shipping_province ? `, ${order.shipping_province}` : ""} {order.shipping_postal_code ?? ""}
          </Text>

          <Heading level={4} className="mt-6">Payment Method</Heading>
          <Text className="uppercase">{order.payment_method}</Text>

          {order.notes && (
            <>
              <Heading level={4} className="mt-6">Notes</Heading>
              <Text>{order.notes}</Text>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
