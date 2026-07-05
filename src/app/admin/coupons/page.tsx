import Link from "next/link";
import { getAdminCoupons } from "@/lib/data/admin/coupons";
import { Heading } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { AdminTable } from "@/components/admin/AdminTable";

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Heading level={1}>Coupons</Heading>
        <Link href="/admin/coupons/new">
          <Button>New Coupon</Button>
        </Link>
      </div>

      <AdminTable headers={["Code", "Discount", "Used", "Limit", "Expires", ""]}>
        {coupons.map((coupon) => (
          <tr key={coupon.id}>
            <td className="px-4 py-3 font-medium">{coupon.code}</td>
            <td className="px-4 py-3">
              {coupon.discount_type === "percent" ? `${coupon.value}%` : `Rs ${coupon.value}`}
            </td>
            <td className="px-4 py-3">{coupon.times_used}</td>
            <td className="px-4 py-3">{coupon.usage_limit ?? "Unlimited"}</td>
            <td className="px-4 py-3">
              {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : "Never"}
            </td>
            <td className="px-4 py-3 text-right">
              <Link href={`/admin/coupons/${coupon.id}`} className="text-sage-700 hover:underline">
                Edit
              </Link>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
