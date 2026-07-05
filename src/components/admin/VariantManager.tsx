"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { variantSchema, type VariantInput } from "@/lib/validations/admin/product";
import { createVariant, updateVariant, deleteVariant } from "@/app/actions/admin/products";
import { generateVariantSku } from "@/lib/slugify";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AdminTable } from "@/components/admin/AdminTable";
import Image from "next/image";
import type { AdminVariationGroup } from "@/lib/data/admin/variations";

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  image_url?: string | null;
  value_ids?: string[];
}

export function VariantManager({
  productId,
  productSku = "",
  variants,
  assignedGroups = [],
}: {
  productId: string;
  productSku?: string;
  variants: Variant[];
  assignedGroups?: AdminVariationGroup[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const usesGroups = assignedGroups.length > 0;
  const skuTouched = useRef(false);

  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(
    Object.fromEntries(assignedGroups.map((g) => [g.id, g.variation_values[0]?.id ?? ""]))
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VariantInput>({ resolver: zodResolver(variantSchema) });

  const nameValue = watch("name");

  function derivedName(): string {
    return assignedGroups
      .map((g) => g.variation_values.find((v) => v.id === selectedValues[g.id])?.value)
      .filter(Boolean)
      .join(" / ");
  }

  useEffect(() => {
    if (usesGroups) return;
    if (!skuTouched.current) {
      setValue("sku", generateVariantSku(productSku, nameValue || ""));
    }
  }, [nameValue, productSku, usesGroups, setValue]);

  useEffect(() => {
    if (!usesGroups) return;
    if (!skuTouched.current) {
      setValue("sku", generateVariantSku(productSku, derivedName()));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValues, productSku, usesGroups]);

  function valueIdsFromSelection(): string[] {
    return assignedGroups.map((g) => selectedValues[g.id]).filter(Boolean);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  async function uploadVariantImage(): Promise<string | null> {
    if (!imageFile) return null;
    setUploading(true);
    const supabase = createClient();
    const path = `${productId}/variant-${Date.now()}-${imageFile.name}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, imageFile);
    setUploading(false);
    if (uploadError) {
      setError(`Image upload failed: ${uploadError.message}`);
      return null;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function onSubmit(values: VariantInput) {
    setError(null);
    if (usesGroups) {
      const missingGroup = assignedGroups.find((g) => !selectedValues[g.id]);
      if (missingGroup) {
        setError(`Add at least one value to "${missingGroup.name}" in Variations first.`);
        return;
      }
      values = { ...values, name: derivedName() };
    }
    const valueIds = usesGroups ? valueIdsFromSelection() : undefined;

    let imageUrl = values.imageUrl ?? null;
    if (imageFile) {
      const uploaded = await uploadVariantImage();
      if (uploaded === null) return;
      imageUrl = uploaded;
    }

    const result = editingId
      ? await updateVariant(editingId, productId, { ...values, imageUrl }, valueIds)
      : await createVariant(productId, { ...values, imageUrl }, valueIds);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    skuTouched.current = false;
    setImageFile(null);
    setImagePreview(null);
    reset(usesGroups ? { sku: "", price: 0, stockQuantity: 0 } : undefined);
    setEditingId(null);
    router.refresh();
  }

  function startEdit(variant: Variant) {
    skuTouched.current = true;
    setEditingId(variant.id);
    setError(null);
    setImageFile(null);
    setImagePreview(variant.image_url ?? null);
    reset({
      name: variant.name,
      sku: variant.sku,
      price: variant.price,
      stockQuantity: variant.stock_quantity,
      imageUrl: variant.image_url ?? null,
    });
    if (usesGroups && variant.value_ids) {
      const next: Record<string, string> = {};
      for (const group of assignedGroups) {
        const match = group.variation_values.find((v) => variant.value_ids!.includes(v.id));
        next[group.id] = match?.id ?? group.variation_values[0]?.id ?? "";
      }
      setSelectedValues(next);
    }
  }

  async function handleDelete(variantId: string) {
    if (!window.confirm("Delete this variant? This cannot be undone.")) return;
    setDeleteError(null);
    const result = await deleteVariant(variantId, productId);
    if (!result.success) {
      const msg = result.error ?? "";
      setDeleteError(
        msg.includes("order_items")
          ? "This variant is linked to existing orders and cannot be deleted. You can set its stock to 0 to hide it from customers."
          : msg || "Failed to delete variant."
      );
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {deleteError && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-xs text-red-600">{deleteError}</p>
      )}

      <AdminTable headers={["Image", "Name", "SKU", "Price", "Stock", ""]}>
        {variants.map((variant) => (
          <tr key={variant.id}>
            <td className="px-4 py-3">
              {variant.image_url ? (
                <Image src={variant.image_url} alt={variant.name} width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-beige-100" />
              )}
            </td>
            <td className="px-4 py-3">{variant.name}</td>
            <td className="px-4 py-3 font-mono text-xs text-charcoal-500">{variant.sku}</td>
            <td className="px-4 py-3">{variant.price}</td>
            <td className="px-4 py-3">{variant.stock_quantity}</td>
            <td className="px-4 py-3 text-right">
              <button type="button" onClick={() => startEdit(variant)} className="mr-3 text-sage-700 hover:underline">
                Edit
              </button>
              <button type="button" onClick={() => handleDelete(variant.id)} className="text-red-600 hover:underline">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-6">
        {usesGroups && (
          <input type="hidden" {...register("name")} defaultValue="pending" />
        )}

        {/* Image upload */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-charcoal-500">Image</label>
          <div className="flex items-center gap-2">
            {imagePreview && (
              <Image src={imagePreview} alt="preview" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
            )}
            <label className="cursor-pointer rounded-lg border border-beige-300 bg-cream-50 px-3 py-2 text-xs text-charcoal-600 hover:bg-beige-50">
              {imagePreview ? "Change" : "Upload"}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            {imagePreview && (
              <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); setValue("imageUrl", null); }} className="text-xs text-charcoal-400 hover:text-red-600">
                Remove
              </button>
            )}
          </div>
        </div>

        {usesGroups ? (
          assignedGroups.map((group) => (
            <div key={group.id}>
              <label className="mb-1 block text-xs text-charcoal-500">{group.name}</label>
              <select
                value={selectedValues[group.id] ?? ""}
                onChange={(e) => setSelectedValues((prev) => ({ ...prev, [group.id]: e.target.value }))}
                className="h-11 w-full rounded-lg border border-beige-300 bg-cream-50 px-3 text-sm"
              >
                {group.variation_values.length === 0 ? (
                  <option value="">No values yet</option>
                ) : (
                  group.variation_values.map((v) => (
                    <option key={v.id} value={v.id}>{v.value}</option>
                  ))
                )}
              </select>
            </div>
          ))
        ) : (
          <Input placeholder="Name" {...register("name")} />
        )}
        <Input
          placeholder="SKU (auto-generated)"
          {...register("sku", { onChange: () => { skuTouched.current = true; } })}
        />
        <Input placeholder="Price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
        <Input placeholder="Stock" type="number" {...register("stockQuantity", { valueAsNumber: true })} />
        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : editingId ? "Update" : "Add"} Variant
        </Button>
      </form>

      {(errors.name || errors.sku || errors.price || errors.stockQuantity || error) && (
        <p className="text-xs text-red-600">
          {errors.name?.message ?? errors.sku?.message ?? errors.price?.message ?? errors.stockQuantity?.message ?? error}
        </p>
      )}

      {editingId && (
        <button
          type="button"
          onClick={() => {
            skuTouched.current = false;
            setEditingId(null);
            setError(null);
            setImageFile(null);
            setImagePreview(null);
            reset({ name: "", sku: "", price: 0, stockQuantity: 0 });
          }}
          className="w-fit text-xs text-charcoal-500 underline"
        >
          Cancel editing
        </button>
      )}
    </div>
  );
}
