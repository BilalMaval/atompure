"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema, type CouponInput } from "@/lib/validations/admin/coupon";
import { createCoupon, updateCoupon } from "@/app/actions/admin/coupons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CouponForm({
  initialValues,
  couponId,
}: {
  initialValues?: Partial<CouponInput>;
  couponId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CouponInput>({
    resolver: zodResolver(couponSchema),
    defaultValues: { discountType: "percent", ...initialValues },
  });

  async function onSubmit(values: CouponInput) {
    setError(null);
    setIsSubmitting(true);
    const result = couponId ? await updateCoupon(couponId, values) : await createCoupon(values);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    router.push("/admin/coupons");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Input placeholder="Code" {...register("code")} />
          {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
        </div>
        <select
          {...register("discountType")}
          className="h-11 rounded-lg border border-beige-300 bg-cream-50 px-4 text-sm"
        >
          <option value="percent">Percent off</option>
          <option value="fixed">Fixed amount off</option>
        </select>
        <div>
          <Input placeholder="Value" type="number" step="0.01" {...register("value", { valueAsNumber: true })} />
          {errors.value && <p className="mt-1 text-xs text-red-600">{errors.value.message}</p>}
        </div>
        <Input placeholder="Usage limit (optional)" type="number" {...register("usageLimit")} />
        <Input placeholder="Expires at (optional)" type="date" {...register("expiresAt")} />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Saving..." : couponId ? "Save Changes" : "Create Coupon"}
      </Button>
    </form>
  );
}
