"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/validations/admin/product";
import {
  createProduct,
  updateProduct,
  addProductImage,
  updateBeforeAfterImage,
  updateHoverImage,
} from "@/app/actions/admin/products";
import { slugify, generateSku } from "@/lib/slugify";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";

interface ProductFormProps {
  categories: { id: string; name: string }[];
  initialValues?: Partial<ProductInput>;
  productId?: string;
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 1).trimEnd() + "…";
}

export function ProductForm({ categories, initialValues, productId }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [beforeAfterFile, setBeforeAfterFile] = useState<File | null>(null);
  const [hoverImageFile, setHoverImageFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // When editing an existing product, its slug/SEO fields already have
  // real content — don't auto-overwrite them as the admin edits the name.
  const slugTouched = useRef(Boolean(productId));
  const seoTitleTouched = useRef(Boolean(productId));
  const seoDescriptionTouched = useRef(Boolean(productId));
  const skuTouched = useRef(Boolean(initialValues?.sku));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true,
      freeHomeDelivery: false,
      stockQuantity: 0,
      baseVariantName: "Standard",
      variantOptionLabel: "Size",
      ...initialValues,
    },
  });

  const nameValue = watch("name");
  const descriptionValue = watch("description");
  const freeHomeDeliveryValue = watch("freeHomeDelivery");
  const stockQuantityValue = watch("stockQuantity");

  useEffect(() => {
    if (!slugTouched.current) {
      setValue("slug", slugify(nameValue || ""));
    }
    if (!seoTitleTouched.current) {
      setValue("seoTitle", nameValue || "");
    }
    if (!skuTouched.current) {
      setValue("sku", generateSku(nameValue || ""));
    }
  }, [nameValue, setValue]);

  useEffect(() => {
    if (!seoDescriptionTouched.current) {
      setValue("seoDescription", truncate(descriptionValue || "", 155));
    }
  }, [descriptionValue, setValue]);

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setImageFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadImages(newProductId: string) {
    const supabase = createClient();
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      setUploadStatus(`Uploading image ${i + 1} of ${imageFiles.length}...`);
      const path = `${newProductId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file);
      if (uploadError) {
        setUploadStatus(null);
        setError(`Product created, but image upload failed: ${uploadError.message}`);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path);
      await addProductImage(newProductId, publicUrlData.publicUrl, file.name, i);
    }

    if (beforeAfterFile) {
      setUploadStatus("Uploading before/after image...");
      const path = `${newProductId}/before-after-${Date.now()}-${beforeAfterFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, beforeAfterFile);
      if (uploadError) {
        setUploadStatus(null);
        setError(`Product created, but before/after image upload failed: ${uploadError.message}`);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path);
      await updateBeforeAfterImage(newProductId, publicUrlData.publicUrl);
    }

    if (hoverImageFile) {
      setUploadStatus("Uploading hover image...");
      const path = `${newProductId}/hover-${Date.now()}-${hoverImageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, hoverImageFile);
      if (uploadError) {
        setUploadStatus(null);
        setError(`Product created, but hover image upload failed: ${uploadError.message}`);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path);
      await updateHoverImage(newProductId, publicUrlData.publicUrl);
    }

    setUploadStatus(null);
  }

  async function onSubmit(values: ProductInput) {
    setError(null);
    setIsSubmitting(true);
    const result = productId
      ? await updateProduct(productId, values)
      : await createProduct(values);

    if (!result.success) {
      setIsSubmitting(false);
      setError(result.error ?? "Something went wrong.");
      return;
    }

    if (!productId && result.id) {
      if (imageFiles.length || beforeAfterFile || hoverImageFile) {
        await uploadImages(result.id);
      }
      setIsSubmitting(false);
      router.push(`/admin/products/${result.id}`);
    } else {
      setIsSubmitting(false);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Input placeholder="Name" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <Input
            placeholder="Slug"
            {...register("slug", { onChange: () => (slugTouched.current = true) })}
          />
          {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
          <Text className="mt-1 text-xs text-charcoal-400">
            Auto-generated from the name — edit to override.
          </Text>
        </div>
        <div>
          <select
            {...register("categoryId")}
            className="h-11 w-full rounded-lg border border-beige-300 bg-cream-50 px-4 text-sm"
            defaultValue=""
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Input placeholder="SKU (auto-generated)" {...register("sku", { onChange: () => { skuTouched.current = true; } })} />
          <Text className="mt-1 text-xs text-charcoal-400">
            This product&apos;s own SKU — used directly if you don&apos;t add any variants below.
          </Text>
        </div>
        <div>
          <Input placeholder="Base price" type="number" step="0.01" {...register("basePrice", { valueAsNumber: true })} />
          {errors.basePrice && (
            <p className="mt-1 text-xs text-red-600">{errors.basePrice.message}</p>
          )}
          <Text className="mt-1 text-xs text-charcoal-400">
            This is what customers pay. Only add variants below if you need different sizes/options
            with their own price and stock.
          </Text>
        </div>
        <div>
          <Input
            placeholder="Stock quantity"
            type="number"
            {...register("stockQuantity", { valueAsNumber: true })}
          />
          {errors.stockQuantity && (
            <p className="mt-1 text-xs text-red-600">{errors.stockQuantity.message}</p>
          )}
          {!errors.stockQuantity && !stockQuantityValue && (
            <p className="mt-1 text-xs font-medium text-amber-600">
              ⚠ Stock is 0 — customers won&apos;t be able to add this to their cart (shows as &ldquo;Out
              of Stock&rdquo;) until you set this above 0, unless you add a variant with its own stock
              below.
            </p>
          )}
          <Text className="mt-1 text-xs text-charcoal-400">
            Used directly if you don&apos;t add any variants below.
          </Text>
        </div>
        <div>
          <Input placeholder="Base option name (e.g. Standard, Regular, 250ml)" {...register("baseVariantName")} />
          {errors.baseVariantName && (
            <p className="mt-1 text-xs text-red-600">{errors.baseVariantName.message}</p>
          )}
          <Text className="mt-1 text-xs text-charcoal-400">
            What this product&apos;s own price/SKU/stock is called when shown next to any variants
            you add below.
          </Text>
        </div>
        <div>
          <Input
            placeholder="Variant option label (e.g. Size, Color, Weight, Dimensions, Quantity)"
            {...register("variantOptionLabel")}
          />
          {errors.variantOptionLabel && (
            <p className="mt-1 text-xs text-red-600">{errors.variantOptionLabel.message}</p>
          )}
          <Text className="mt-1 text-xs text-charcoal-400">
            The group title shown above the variant choices on the product page.
          </Text>
        </div>
        <div>
          <Input
            placeholder="Sale price (optional)"
            type="number"
            step="0.01"
            {...register("salePrice", {
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
          />
          {errors.salePrice && (
            <p className="mt-1 text-xs text-red-600">{errors.salePrice.message}</p>
          )}
          <Text className="mt-1 text-xs text-charcoal-400">
            If lower than base price, shown as a discounted price (applied to variant prices too, if
            you add any).
          </Text>
        </div>
      </div>

      <div className="grid gap-4 rounded-lg border border-beige-200 p-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Text className="text-xs uppercase tracking-wide text-charcoal-500">
            Delivery Charges
          </Text>
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" {...register("freeHomeDelivery")} />
          Free home delivery (shows a badge on the product page)
        </label>
        <div>
          <Input
            placeholder="Delivery charge (PKR, optional)"
            type="number"
            step="0.01"
            disabled={freeHomeDeliveryValue}
            {...register("deliveryCharge", {
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
          />
          {errors.deliveryCharge && (
            <p className="mt-1 text-xs text-red-600">{errors.deliveryCharge.message}</p>
          )}
        </div>
        <div>
          <Input
            placeholder="Free delivery above (PKR, optional)"
            type="number"
            step="0.01"
            disabled={freeHomeDeliveryValue}
            {...register("freeDeliveryMinPrice", {
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
          />
          {errors.freeDeliveryMinPrice && (
            <p className="mt-1 text-xs text-red-600">{errors.freeDeliveryMinPrice.message}</p>
          )}
        </div>
        <Text className="text-xs text-charcoal-400 sm:col-span-2">
          {freeHomeDeliveryValue
            ? "Free home delivery is enabled — the charges above are disabled."
            : "Leave both blank to use the store's default shipping settings."}
        </Text>
      </div>

      <textarea
        placeholder="Description"
        {...register("description")}
        className="min-h-24 rounded-lg border border-beige-300 bg-cream-50 p-4 text-sm"
      />
      <textarea
        placeholder="Benefits"
        {...register("benefits")}
        className="min-h-20 rounded-lg border border-beige-300 bg-cream-50 p-4 text-sm"
      />
      <textarea
        placeholder="How to use"
        {...register("howToUse")}
        className="min-h-20 rounded-lg border border-beige-300 bg-cream-50 p-4 text-sm"
      />

      <div>
        <Text className="mb-2 text-xs uppercase tracking-wide text-charcoal-500">
          SEO (auto-filled from name/description — editable)
        </Text>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            placeholder="SEO title"
            {...register("seoTitle", { onChange: () => (seoTitleTouched.current = true) })}
          />
          <Input
            placeholder="SEO description"
            {...register("seoDescription", {
              onChange: () => (seoDescriptionTouched.current = true),
            })}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isActive")} />
        Active (visible on storefront)
      </label>

      {!productId && (
        <div>
          <Text className="mb-2 text-xs uppercase tracking-wide text-charcoal-500">
            Main image &amp; gallery
          </Text>
          {imageFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-3">
              {imageFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex flex-col gap-1">
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-beige-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-sage-600 px-1.5 py-0.5 text-[10px] font-medium text-cream-50">
                        Main
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-xs text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagePick}
            className="text-sm"
          />
          <Text className="mt-1 text-xs text-charcoal-400">
            The first image becomes the main image. More can be added after saving.
          </Text>
        </div>
      )}

      {!productId && (
        <div>
          <Text className="mb-2 text-xs uppercase tracking-wide text-charcoal-500">
            Hover Image
          </Text>
          {hoverImageFile && (
            <div className="relative mb-3 h-24 w-24 overflow-hidden rounded-lg bg-beige-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(hoverImageFile)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setHoverImageFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            {hoverImageFile && (
              <button
                type="button"
                onClick={() => setHoverImageFile(null)}
                className="text-xs text-red-600"
              >
                Remove
              </button>
            )}
          </div>
          <Text className="mt-1 text-xs text-charcoal-400">
            Shown on product cards when a shopper hovers. Optional.
          </Text>
        </div>
      )}

      {!productId && (
        <div>
          <Text className="mb-2 text-xs uppercase tracking-wide text-charcoal-500">
            Before / After Result Banner
          </Text>
          {beforeAfterFile && (
            <div className="relative mb-3 h-24 w-full max-w-md overflow-hidden rounded-lg bg-beige-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(beforeAfterFile)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBeforeAfterFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            {beforeAfterFile && (
              <button
                type="button"
                onClick={() => setBeforeAfterFile(null)}
                className="text-xs text-red-600"
              >
                Remove
              </button>
            )}
          </div>
          <Text className="mt-1 text-xs text-charcoal-400">
            Shown as a full-width banner on the product page. Optional.
          </Text>
          {uploadStatus && <Text className="mt-1 text-xs text-charcoal-500">{uploadStatus}</Text>}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Saving..." : productId ? "Save Changes" : "Create Product"}
      </Button>
    </form>
  );
}
