import { getCategories } from "@/lib/data/products";
import { Heading } from "@/components/ui/Typography";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-6">
      <Heading level={1}>New Product</Heading>
      <ProductForm categories={categories} />
    </div>
  );
}
