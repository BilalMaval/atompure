import { Heading } from "@/components/ui/Typography";
import { CouponForm } from "@/components/admin/CouponForm";

export default function NewCouponPage() {
  return (
    <div className="flex flex-col gap-6">
      <Heading level={1}>New Coupon</Heading>
      <CouponForm />
    </div>
  );
}
