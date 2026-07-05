import { getAdminOrderById } from "@/lib/data/admin/orders";
import { InvoiceDocument } from "@/components/admin/InvoiceDocument";
import { PrintButton } from "@/components/admin/PrintButton";

export default async function BulkInvoicesPrintPage({
  searchParams,
}: {
  searchParams: { ids?: string };
}) {
  const ids = (searchParams.ids ?? "").split(",").filter(Boolean);
  const orders = await Promise.all(ids.map((id) => getAdminOrderById(id)));
  const validOrders = orders.filter((o): o is NonNullable<typeof o> => o !== null);

  return (
    <div>
      {validOrders.length === 0 ? (
        <p className="p-10 text-charcoal-600">No orders found.</p>
      ) : (
        validOrders.map((order) => <InvoiceDocument key={order.id} order={order} />)
      )}
      <div className="mx-auto max-w-2xl">
        <PrintButton />
      </div>
    </div>
  );
}
