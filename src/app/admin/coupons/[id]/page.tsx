import { notFound } from "next/navigation";
import { getAdminCouponById } from "@/lib/data/admin/coupons";
import { Heading } from "@/components/ui/Typography";
import { CouponForm } from "@/components/admin/CouponForm";
import { DeleteCouponButton } from "@/components/admin/DeleteCouponButton";

export default async function EditCouponPage({ params }: { params: { id: string } }) {
  const coupon = await getAdminCouponById(params.id);
  if (!coupon) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Heading level={1}>Edit Coupon</Heading>
        <DeleteCouponButton couponId={coupon.id} />
      </div>
      <CouponForm
        couponId={coupon.id}
        initialValues={{
          code: coupon.code,
          discountType: coupon.discount_type,
          value: coupon.value,
          usageLimit: coupon.usage_limit ? String(coupon.usage_limit) : "",
          expiresAt: coupon.expires_at ? coupon.expires_at.slice(0, 10) : "",
        }}
      />
    </div>
  );
}
