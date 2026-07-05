"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bannerSchema, type BannerInput } from "@/lib/validations/admin/banner";
import { createBanner, updateBanner } from "@/app/actions/admin/banners";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BannerImageUpload } from "@/components/admin/BannerImageUpload";

interface BannerFormProps {
  products: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  initialValues?: Partial<BannerInput>;
  bannerId?: string;
}

const SELECT_CLASS = "h-11 w-full rounded-lg border border-beige-300 bg-cream-50 px-4 text-sm";

export function BannerForm({ products, categories, initialValues, bannerId }: BannerFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<BannerInput>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      mode: "split",
      headingSize: "lg",
      headingPosition: "left",
      backgroundColor: "sage",
      imagePosition: "left",
      buttonText: "Shop Now",
      isActive: true,
      ...initialValues,
    },
  });

  const mode = watch("mode");

  async function onSubmit(values: BannerInput) {
    setError(null);
    setIsSubmitting(true);
    const result = bannerId ? await updateBanner(bannerId, values) : await createBanner(values);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    router.push("/admin/homepage-banners");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Mode</label>
        <select {...register("mode")} className={SELECT_CLASS}>
          <option value="split">Split (image + text)</option>
          <option value="image">Full image (whole banner is one clickable image)</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Link to Product</label>
          <select {...register("productId")} className={SELECT_CLASS} defaultValue="">
            <option value="">None</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Link to Category</label>
          <select {...register("categoryId")} className={SELECT_CLASS} defaultValue="">
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input placeholder="Custom link (optional, used if no product/category selected)" {...register("customLink")} />

      <div>
        <Input placeholder="Heading (optional — defaults to linked product's name)" {...register("heading")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Heading Size</label>
          <select {...register("headingSize")} className={SELECT_CLASS}>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra Large</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Heading Position</label>
          <select {...register("headingPosition")} className={SELECT_CLASS}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      {mode === "split" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Background Color</label>
              <select {...register("backgroundColor")} className={SELECT_CLASS}>
                <option value="sage">Sage</option>
                <option value="cream">Cream</option>
                <option value="beige">Beige</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Image Side</label>
              <select {...register("imagePosition")} className={SELECT_CLASS}>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          <Controller
            name="imageUrl"
            control={control}
            render={({ field }) => (
              <BannerImageUpload
                label="Side image (optional — falls back to the linked product's photo)"
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
        </>
      ) : (
        <Controller
          name="backgroundImageUrl"
          control={control}
          render={({ field }) => (
            <BannerImageUpload
              label="Full banner image"
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
      )}

      <div>
        <Input placeholder="Button text" {...register("buttonText")} />
        {errors.buttonText && <p className="mt-1 text-xs text-red-600">{errors.buttonText.message}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isActive")} />
        Active (visible on homepage)
      </label>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Saving..." : bannerId ? "Save Changes" : "Create Banner"}
      </Button>
    </form>
  );
}
