import { notFound } from "next/navigation";
import { getAdminBannerById } from "@/lib/data/admin/banners";
import { getAdminProducts } from "@/lib/data/admin/products";
import { getAdminCategories } from "@/lib/data/admin/categories";
import { Heading } from "@/components/ui/Typography";
import { BannerForm } from "@/components/admin/BannerForm";
import { DeleteBannerButton } from "@/components/admin/DeleteBannerButton";

export default async function EditBannerPage({ params }: { params: { id: string } }) {
  const [banner, products, categories] = await Promise.all([
    getAdminBannerById(params.id),
    getAdminProducts(),
    getAdminCategories(),
  ]);

  if (!banner) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Heading level={1}>Edit Homepage Banner</Heading>
        <DeleteBannerButton bannerId={banner.id} />
      </div>
      <BannerForm
        products={products}
        categories={categories}
        bannerId={banner.id}
        initialValues={{
          mode: banner.mode,
          productId: banner.product_id ?? undefined,
          categoryId: banner.category_id ?? undefined,
          customLink: banner.custom_link ?? "",
          heading: banner.heading ?? "",
          headingSize: banner.heading_size,
          headingPosition: banner.heading_position,
          backgroundColor: banner.background_color,
          backgroundImageUrl: banner.background_image_url ?? "",
          imageUrl: banner.image_url ?? "",
          imagePosition: banner.image_position,
          buttonText: banner.button_text,
          isActive: banner.is_active,
        }}
      />
    </div>
  );
}
