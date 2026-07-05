"use client";

import { useRouter } from "next/navigation";
import { deleteCoupon } from "@/app/actions/admin/coupons";
import { Button } from "@/components/ui/Button";

export function DeleteCouponButton({ couponId }: { couponId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm("Delete this coupon?")) return;
    await deleteCoupon(couponId);
    router.push("/admin/coupons");
  }

  return (
    <Button variant="outline" onClick={handleDelete} className="border-red-600 text-red-600 hover:bg-red-50">
      Delete Coupon
    </Button>
  );
}
