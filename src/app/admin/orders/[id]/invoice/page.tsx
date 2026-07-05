import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/lib/data/admin/orders";
import { InvoiceDocument } from "@/components/admin/InvoiceDocument";
import { PrintButton } from "@/components/admin/PrintButton";

export default async function OrderInvoicePage({ params }: { params: { id: string } }) {
  const order = await getAdminOrderById(params.id);
  if (!order) notFound();

  return (
    <div>
      <InvoiceDocument order={order} />
      <div className="mx-auto max-w-2xl">
        <PrintButton />
      </div>
    </div>
  );
}
