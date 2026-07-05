import Link from "next/link";
import { getAdminCategories } from "@/lib/data/admin/categories";
import { Heading } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { AdminTable } from "@/components/admin/AdminTable";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  const byId = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Heading level={1}>Categories</Heading>
        <Link href="/admin/categories/new">
          <Button>New Category</Button>
        </Link>
      </div>

      <AdminTable headers={["Name", "Slug", "Parent", "Sort Order", ""]}>
        {categories.map((category) => (
          <tr key={category.id}>
            <td className="px-4 py-3">
              {category.parent_id ? <span className="mr-2 text-charcoal-400">↳</span> : null}
              {category.name}
            </td>
            <td className="px-4 py-3">{category.slug}</td>
            <td className="px-4 py-3">
              {category.parent_id ? byId.get(category.parent_id)?.name ?? "—" : "—"}
            </td>
            <td className="px-4 py-3">{category.sort_order}</td>
            <td className="px-4 py-3 text-right">
              <Link href={`/admin/categories/${category.id}`} className="text-sage-700 hover:underline">
                Edit
              </Link>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
