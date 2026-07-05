import { getAdminProducts } from "@/lib/data/admin/products";
import { getAdminCategories } from "@/lib/data/admin/categories";
import { Heading } from "@/components/ui/Typography";
import { BannerForm } from "@/components/admin/BannerForm";

export default async function NewBannerPage() {
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);

  return (
    <div className="flex flex-col gap-6">
      <Heading level={1}>New Homepage Banner</Heading>
      <BannerForm products={products} categories={categories} />
    </div>
  );
}
