import Link from "next/link";
import { getAdminOrders } from "@/lib/data/admin/orders";
import { Heading } from "@/components/ui/Typography";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { clsx } from "@/lib/utils";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const orders = await getAdminOrders({ status: searchParams.status });

  return (
    <div className="flex flex-col gap-6">
      <Heading level={1}>Orders</Heading>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
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
            href={`/admin/orders?status=${status}`}
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

      <OrdersTable orders={orders} />
    </div>
  );
}
