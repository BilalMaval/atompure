"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/actions/admin/products";
import { Button } from "@/components/ui/Button";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setError(null);
    const result = await deleteProduct(productId);
    if (!result.success) {
      const msg = result.error ?? "";
      setError(
        msg.includes("order_items")
          ? "This product has variants linked to existing orders and cannot be deleted. Set it to inactive instead to hide it from customers."
          : msg || "Failed to delete product."
      );
      return;
    }
    router.push("/admin/products");
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" onClick={handleDelete} className="border-red-600 text-red-600 hover:bg-red-50">
        Delete Product
      </Button>
      {error && <p className="max-w-xs text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
