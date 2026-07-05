import { getAdminCategories } from "@/lib/data/admin/categories";
import { Heading } from "@/components/ui/Typography";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function NewCategoryPage() {
  const categories = await getAdminCategories();

  return (
    <div className="flex flex-col gap-6">
      <Heading level={1}>New Category</Heading>
      <CategoryForm categories={categories} />
    </div>
  );
}
