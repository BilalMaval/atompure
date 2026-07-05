import Link from "next/link";
import Image from "next/image";
import { getMyOrders } from "@/lib/data/account";
import { Heading, Text } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { ReorderButton } from "@/components/storefront/ReorderButton";
import { formatPrice } from "@/lib/format";

export default async function AccountOrdersPage() {
  const orders = await getMyOrders();

  return (
    <div>
      <Heading level={1} className="mb-6">
        My Orders
      </Heading>

      {orders.length === 0 ? (
        <Text>
          You haven&apos;t placed any orders yet.{" "}
          <Link href="/shop" className="text-sage-700 underline">
            Start shopping
          </Link>
          .
        </Text>
      ) : (
        <ul className="flex flex-col gap-6">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-beige-200 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <Text className="font-medium text-charcoal-800">{order.order_number}</Text>
                  <Text className="text-xs text-charcoal-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </Text>
                </div>
                <Badge>{order.status}</Badge>
              </div>
              <ul className="mb-4 flex flex-col gap-1">
                {order.order_items.map((item) => {
                  const imgUrl = item.image_url
                    ?? item.product_variant?.product?.product_images?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url
                    ?? null;
                  const productName = item.product_name ?? item.product_variant?.product?.name ?? "Product removed";
                  const variantName = item.variant_name ?? item.product_variant?.name ?? "";
                  return (
                  <li key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-beige-100">
                      {imgUrl ? (
                        <Image src={imgUrl} alt={productName} width={48} height={48} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[7px] text-sage-400">ATOM PURE</div>
                      )}
                    </div>
                    <div className="flex flex-1 justify-between gap-2">
                      <span>{productName}{variantName ? ` (${variantName})` : ""} &times; {item.quantity}</span>
                      <span>{formatPrice(item.unit_price * item.quantity)}</span>
                    </div>
                  </li>
                  );
                })}
              </ul>
              <div className="flex items-center justify-between border-t border-beige-200 pt-4">
                <Text className="font-medium text-charcoal-800">{formatPrice(order.total)}</Text>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/order-confirmation/${order.order_number}`}
                    className="text-sm text-sage-700 underline"
                  >
                    View Receipt
                  </Link>
                  <ReorderButton order={order} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
