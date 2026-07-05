"use client";

import { useRouter } from "next/navigation";
import { deleteCategory } from "@/app/actions/admin/categories";
import { Button } from "@/components/ui/Button";

export function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm("Delete this category?")) return;
    await deleteCategory(categoryId);
    router.push("/admin/categories");
  }

  return (
    <Button variant="outline" onClick={handleDelete} className="border-red-600 text-red-600 hover:bg-red-50">
      Delete Category
    </Button>
  );
}
