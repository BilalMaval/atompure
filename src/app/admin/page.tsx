import Link from "next/link";
import { getDashboardStats } from "@/lib/data/admin/dashboard";
import { Heading, Text } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { AdminTable } from "@/components/admin/AdminTable";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-8">
      <Heading level={1}>Dashboard</Heading>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <Text className="text-xs uppercase tracking-wide text-sage-600">Revenue</Text>
          <Heading level={3}>{formatPrice(stats.revenue)}</Heading>
        </Card>
        <Card>
          <Text className="text-xs uppercase tracking-wide text-sage-600">Orders</Text>
          <Heading level={3}>{stats.orderCount}</Heading>
        </Card>
        <Card>
          <Text className="text-xs uppercase tracking-wide text-sage-600">Customers</Text>
          <Heading level={3}>{stats.customerCount}</Heading>
        </Card>
      </div>

      <div>
        <Heading level={3} className="mb-4">
          Revenue (Last 30 Days)
        </Heading>
        <RevenueChart data={stats.revenueByDay} />
      </div>

      <div>
        <Heading level={3} className="mb-4">
          Recent Orders
        </Heading>
        {stats.recentOrders.length === 0 ? (
          <Text>No orders yet.</Text>
        ) : (
          <AdminTable headers={["Order", "Total", "Status", "Date"]}>
            {stats.recentOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-sage-700 hover:underline">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3">{formatPrice(order.total)}</td>
                <td className="px-4 py-3 capitalize">{order.status}</td>
                <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>

      <div>
        <Heading level={3} className="mb-4">
          Low Stock Alerts
        </Heading>
        {stats.lowStockVariants.length === 0 ? (
          <Text>All variants are well stocked.</Text>
        ) : (
          <AdminTable headers={["Product", "Variant", "SKU", "Stock"]}>
            {stats.lowStockVariants.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-3">{v.product_name}</td>
                <td className="px-4 py-3">{v.name}</td>
                <td className="px-4 py-3">{v.sku}</td>
                <td className="px-4 py-3 text-red-600">{v.stock_quantity}</td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>
    </div>
  );
}
