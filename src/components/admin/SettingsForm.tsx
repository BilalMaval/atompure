"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storeSettingsSchema, type StoreSettingsInput } from "@/lib/validations/admin/settings";
import { updateStoreSettings } from "@/app/actions/admin/settings";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";

export function SettingsForm({ initialValues }: { initialValues: StoreSettingsInput }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreSettingsInput>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: StoreSettingsInput) {
    setError(null);
    setSaved(false);
    setIsSubmitting(true);
    const result = await updateStoreSettings(values);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-4">
      <div>
        <Input placeholder="Store name" {...register("storeName")} />
        {errors.storeName && <p className="mt-1 text-xs text-red-600">{errors.storeName.message}</p>}
      </div>
      <div>
        <Input placeholder="Support email" type="email" {...register("supportEmail")} />
        {errors.supportEmail && (
          <p className="mt-1 text-xs text-red-600">{errors.supportEmail.message}</p>
        )}
      </div>
      <Input placeholder="Support phone" {...register("supportPhone")} />
      <div>
        <Input placeholder="Google Analytics Measurement ID (optional)" {...register("gaMeasurementId")} />
        <Text className="mt-1 text-xs text-charcoal-500">
          Set a real GA4 Measurement ID to enable tracking site-wide.
        </Text>
      </div>
      <div>
        <Input
          placeholder="Flat shipping rate (PKR)"
          type="number"
          step="0.01"
          {...register("flatShippingRate", { valueAsNumber: true })}
        />
        {errors.flatShippingRate && (
          <p className="mt-1 text-xs text-red-600">{errors.flatShippingRate.message}</p>
        )}
        <Text className="mt-1 text-xs text-charcoal-500">
          Charged when the cart subtotal is below the free-shipping threshold below.
        </Text>
      </div>
      <div>
        <Input
          placeholder="Free shipping threshold (PKR)"
          type="number"
          step="0.01"
          {...register("freeShippingThreshold", { valueAsNumber: true })}
        />
        {errors.freeShippingThreshold && (
          <p className="mt-1 text-xs text-red-600">{errors.freeShippingThreshold.message}</p>
        )}
        <Text className="mt-1 text-xs text-charcoal-500">
          Storewide — orders at or above this subtotal ship free. Individual products can also set
          their own lower threshold or always-free delivery on the product edit page.
        </Text>
      </div>
      <div>
        <Input
          placeholder="Tax rate (%)"
          type="number"
          step="0.01"
          {...register("taxRatePercent", { valueAsNumber: true })}
        />
        {errors.taxRatePercent && (
          <p className="mt-1 text-xs text-red-600">{errors.taxRatePercent.message}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? "Saving..." : "Save Settings"}
        </Button>
        {saved && <span className="text-xs text-sage-700">Saved</span>}
      </div>
    </form>
  );
}
