import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminCustomerById } from "@/lib/data/admin/customers";
import { Heading, Text } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { AdminTable } from "@/components/admin/AdminTable";
import { CustomerNotes } from "@/components/admin/CustomerNotes";
import { formatPrice } from "@/lib/format";

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getAdminCustomerById(params.id);
  if (!customer) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Heading level={1}>{customer.profile.full_name ?? "Unnamed Customer"}</Heading>
        <Text>{customer.email}</Text>
        <Text>{customer.profile.phone}</Text>
      </div>

      <div>
        <Heading level={3} className="mb-4">
          Order History
        </Heading>
        {customer.orders.length === 0 ? (
          <Text>No orders yet.</Text>
        ) : (
          <AdminTable headers={["Order", "Total", "Status", "Date"]}>
            {customer.orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-sage-700 hover:underline">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <Badge>{order.status}</Badge>
                </td>
                <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>

      <div>
        <Heading level={3} className="mb-4">
          Admin Notes
        </Heading>
        <CustomerNotes customerId={customer.profile.id} initialNotes={customer.profile.admin_notes ?? ""} />
      </div>
    </div>
  );
}
