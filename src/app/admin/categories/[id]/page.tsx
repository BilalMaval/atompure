import { notFound } from "next/navigation";
import { getAdminCategories, getAdminCategoryById } from "@/lib/data/admin/categories";
import { Heading } from "@/components/ui/Typography";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const [category, categories] = await Promise.all([
    getAdminCategoryById(params.id),
    getAdminCategories(),
  ]);

  if (!category) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Heading level={1}>Edit Category</Heading>
        <DeleteCategoryButton categoryId={category.id} />
      </div>
      <CategoryForm
        categories={categories}
        categoryId={category.id}
        initialValues={{
          name: category.name,
          slug: category.slug,
          parentId: category.parent_id,
          sortOrder: category.sort_order,
          seoTitle: category.seo_title ?? "",
          seoDescription: category.seo_description ?? "",
        }}
      />
    </div>
  );
}
