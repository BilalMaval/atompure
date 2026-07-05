"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { reorderProducts } from "@/app/actions/admin/products";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/format";
import type { AdminProductListRow } from "@/lib/data/admin/products";

export function AdminProductsTable({ products }: { products: AdminProductListRow[] }) {
  const router = useRouter();
  const [order, setOrder] = useState(products.map((p) => p.id));
  const [isReordering, setIsReordering] = useState(false);
  const dragIndex = useRef<number | null>(null);

  const itemsById = new Map(products.map((p) => [p.id, p]));

  function handleDragStart(e: React.DragEvent, index: number) {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragEnter(index: number) {
    if (dragIndex.current === null || dragIndex.current === index) return;
    const fromIndex = dragIndex.current;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (dragIndex.current === null) return;
    dragIndex.current = null;
    setIsReordering(true);
    await reorderProducts(order);
    setIsReordering(false);
    router.refresh();
  }

  function handleDragEnd() {
    dragIndex.current = null;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-beige-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-cream-100 text-charcoal-600">
          <tr>
            {["", "Name", "Category", "Price", "Stock", "Status", ""].map((header, i) => (
              <th key={i} className="px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-beige-200">
          {order.map((id, index) => {
            const product = itemsById.get(id);
            if (!product) return null;
            const totalStock = (product.product_variants ?? []).reduce(
              (sum, v) => sum + v.stock_quantity,
              0
            );
            const image = [...(product.product_images ?? [])].sort(
              (a, b) => a.sort_order - b.sort_order
            )[0];

            return (
              <tr
                key={id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className="cursor-move"
              >
                <td className="px-4 py-3 text-charcoal-400" aria-hidden>
                  ☰
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {image ? (
                      <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded bg-beige-100">
                        <Image
                          src={image.url}
                          alt=""
                          fill
                          sizes="36px"
                          draggable={false}
                          className="pointer-events-none object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-9 w-9 flex-shrink-0 rounded bg-beige-100" />
                    )}
                    {product.name}
                  </div>
                </td>
                <td className="px-4 py-3">{product.category?.name ?? "—"}</td>
                <td className="px-4 py-3">{formatPrice(product.base_price)}</td>
                <td className="px-4 py-3">{totalStock}</td>
                <td className="px-4 py-3">
                  <Badge className={product.is_active ? "" : "bg-beige-200 text-charcoal-600"}>
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <ProductRowActions productId={product.id} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isReordering && (
        <p className="border-t border-beige-200 px-4 py-2 text-xs text-charcoal-500">
          Saving order...
        </p>
      )}
    </div>
  );
}
