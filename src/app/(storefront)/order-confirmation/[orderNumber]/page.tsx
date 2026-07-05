import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getOrderByNumber } from "@/lib/data/orders";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";

export default async function OrderConfirmationPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const order = await getOrderByNumber(params.orderNumber);
  if (!order) notFound();

  return (
    <Container className="py-16">
      <Heading level={1} className="mb-2">
        Thank you for your order!
      </Heading>
      <Text className="mb-8">
        Order <strong>{order.order_number}</strong> has been placed and will be
        delivered via Cash on Delivery.
      </Text>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <Heading level={3} className="mb-4">
            Items
          </Heading>
          <ul className="flex flex-col gap-3">
            {order.order_items.map((item) => {
              const imgUrl = item.image_url
                ?? item.product_variant?.product?.product_images?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url
                ?? null;
              const productName = item.product_name ?? item.product_variant?.product?.name ?? "Product removed";
              const variantName = item.variant_name ?? item.product_variant?.name ?? "";
              return (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-beige-100">
                    {imgUrl ? (
                      <Image src={imgUrl} alt={productName} width={56} height={56} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[8px] text-sage-400">ATOM PURE</div>
                    )}
                  </div>
                  <div className="flex flex-1 justify-between gap-2">
                    <span className="text-charcoal-700">
                      {productName}{variantName ? ` (${variantName})` : ""} &times; {item.quantity}
                    </span>
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
            <div className="flex justify-between border-t border-beige-200 pt-2 font-medium text-charcoal-800">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div>
          <Heading level={3} className="mb-4">
            Shipping To
          </Heading>
          <Text>{order.shipping_full_name}</Text>
          <Text>{order.shipping_phone}</Text>
          <Text>
            {order.shipping_line1}
            {order.shipping_line2 ? `, ${order.shipping_line2}` : ""}
          </Text>
          <Text>
            {order.shipping_city}
            {order.shipping_province ? `, ${order.shipping_province}` : ""}{" "}
            {order.shipping_postal_code ?? ""}
          </Text>
        </div>
      </div>

      <Link href="/shop" className="mt-10 inline-block">
        <Button>Continue Shopping</Button>
      </Link>
    </Container>
  );
}
