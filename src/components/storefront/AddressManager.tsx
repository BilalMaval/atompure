"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, type AddressInput } from "@/lib/validations/account";
import { createAddress, updateAddress, deleteAddress } from "@/app/actions/account";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Address } from "@/lib/data/addresses";

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "PK", isDefault: false },
  });

  async function onSubmit(values: AddressInput) {
    setError(null);
    const result = editingId
      ? await updateAddress(editingId, values)
      : await createAddress(values);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    reset({ country: "PK", isDefault: false });
    setEditingId(null);
    setIsAdding(false);
    router.refresh();
  }

  function startEdit(address: Address) {
    setIsAdding(true);
    setEditingId(address.id);
    reset({
      fullName: address.full_name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      province: address.province ?? "",
      postalCode: address.postal_code ?? "",
      country: address.country,
      isDefault: address.is_default,
    });
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this address?")) return;
    await deleteAddress(id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-4">
        {addresses.map((address) => (
          <li key={address.id} className="rounded-2xl border border-beige-200 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-medium text-charcoal-800">{address.full_name}</span>
              {address.is_default && <Badge>Default</Badge>}
            </div>
            <p className="text-sm text-charcoal-600">{address.phone}</p>
            <p className="text-sm text-charcoal-600">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}, {address.city}
            </p>
            <div className="mt-3 flex gap-3 text-sm">
              <button onClick={() => startEdit(address)} className="text-sage-700 hover:underline">
                Edit
              </button>
              <button onClick={() => handleDelete(address.id)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {isAdding ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 rounded-2xl border border-beige-200 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Full name" {...register("fullName")} />
            <Input placeholder="Phone" {...register("phone")} />
            <div className="sm:col-span-2">
              <Input placeholder="Address line 1" {...register("line1")} />
            </div>
            <div className="sm:col-span-2">
              <Input placeholder="Address line 2 (optional)" {...register("line2")} />
            </div>
            <Input placeholder="City" {...register("city")} />
            <Input placeholder="Province (optional)" {...register("province")} />
            <Input placeholder="Postal code (optional)" {...register("postalCode")} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isDefault")} />
            Set as default address
          </label>
          {(errors.fullName || errors.phone || errors.line1 || errors.city || error) && (
            <p className="text-xs text-red-600">
              {errors.fullName?.message ?? errors.phone?.message ?? errors.line1?.message ?? errors.city?.message ?? error}
            </p>
          )}
          <div className="flex gap-3">
            <Button type="submit" size="sm" className="w-fit">
              {editingId ? "Save Changes" : "Add Address"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                reset({ country: "PK", isDefault: false });
              }}
              className="text-sm text-charcoal-500 underline"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <Button variant="outline" className="w-fit" onClick={() => setIsAdding(true)}>
          Add New Address
        </Button>
      )}
    </div>
  );
}
