"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProduct } from "@/app/actions/admin/products";

export function ProductRowActions({ productId }: { productId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setIsDeleting(true);
    await deleteProduct(productId);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <Link href={`/admin/products/${productId}`} className="text-sage-700 hover:underline">
        Edit
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Delete product"
        className="text-red-600 hover:underline disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.84 12.14A2 2 0 0 1 16.17 21H7.83a2 2 0 0 1-1.99-1.86L5 7h14Z" />
        </svg>
      </button>
    </div>
  );
}
