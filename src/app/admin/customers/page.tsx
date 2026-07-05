import Link from "next/link";
import { getAdminCustomers } from "@/lib/data/admin/customers";
import { Heading } from "@/components/ui/Typography";
import { AdminTable } from "@/components/admin/AdminTable";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <div className="flex flex-col gap-6">
      <Heading level={1}>Customers</Heading>

      <AdminTable headers={["Name", "Email", "Phone", "Joined", ""]}>
        {customers.map((customer) => (
          <tr key={customer.id}>
            <td className="px-4 py-3">{customer.full_name ?? "—"}</td>
            <td className="px-4 py-3">{customer.email ?? "—"}</td>
            <td className="px-4 py-3">{customer.phone ?? "—"}</td>
            <td className="px-4 py-3">{new Date(customer.created_at).toLocaleDateString()}</td>
            <td className="px-4 py-3 text-right">
              <Link href={`/admin/customers/${customer.id}`} className="text-sage-700 hover:underline">
                View
              </Link>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
