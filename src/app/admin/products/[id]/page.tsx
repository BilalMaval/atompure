import { notFound } from "next/navigation";
import { getAdminProductById } from "@/lib/data/admin/products";
import { getCategories } from "@/lib/data/products";
import { getVariationGroups, getProductVariationGroups } from "@/lib/data/admin/variations";
import { Heading, Text } from "@/components/ui/Typography";
import { ProductForm } from "@/components/admin/ProductForm";
import { VariantManager } from "@/components/admin/VariantManager";
import { ProductVariationGroupsManager } from "@/components/admin/ProductVariationGroupsManager";
import { ImageManager } from "@/components/admin/ImageManager";
import { BeforeAfterImageManager } from "@/components/admin/BeforeAfterImageManager";
import { HoverImageManager } from "@/components/admin/HoverImageManager";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories, allGroups, assignedGroups] = await Promise.all([
    getAdminProductById(params.id),
    getCategories(),
    getVariationGroups(),
    getProductVariationGroups(params.id),
  ]);

  if (!product) notFound();

  interface RawVariant {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
    is_default_variant?: boolean;
    product_variant_values?: { value_id: string }[];
  }

  const variantsWithValueIds = ((product.product_variants ?? []) as RawVariant[]).map((v) => ({
    ...v,
    value_ids: (v.product_variant_values ?? []).map((pv) => pv.value_id),
  }));

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <Heading level={1}>Edit Product</Heading>
          <DeleteProductButton productId={product.id} />
        </div>
        <ProductForm
          categories={categories}
          productId={product.id}
          initialValues={{
            name: product.name,
            slug: product.slug,
            categoryId: product.category_id,
            description: product.description ?? "",
            benefits: product.benefits ?? "",
            howToUse: product.how_to_use ?? "",
            sku: product.sku ?? "",
            basePrice: product.base_price,
            stockQuantity: product.stock_quantity ?? 0,
            baseVariantName: product.base_variant_name ?? "Standard",
            variantOptionLabel: product.variant_option_label ?? "Size",
            salePrice: product.sale_price ?? undefined,
            deliveryCharge: product.delivery_charge ?? undefined,
            freeDeliveryMinPrice: product.free_delivery_min_price ?? undefined,
            freeHomeDelivery: product.free_home_delivery ?? false,
            isActive: product.is_active,
            seoTitle: product.seo_title ?? "",
            seoDescription: product.seo_description ?? "",
          }}
        />
      </div>

      <div>
        <Heading level={3} className="mb-1">
          Variation Groups
        </Heading>
        <Text className="mb-4 text-sm text-charcoal-500">
          Optional. Assign one or more reusable variation groups (manage the library in{" "}
          <a href="/admin/variations" className="text-sage-700 underline">
            Variations
          </a>
          ) to this product. Once assigned, variants below are built by picking a value from each
          group instead of typing a free-text name.
        </Text>
        <ProductVariationGroupsManager
          productId={product.id}
          allGroups={allGroups}
          assignedGroupIds={assignedGroups.map((g) => g.id)}
        />
      </div>

      <div>
        <Heading level={3} className="mb-1">
          Variants
        </Heading>
        <Text className="mb-4 text-sm text-charcoal-500">
          The price/SKU/stock above is always available to customers under the &ldquo;Base option name&rdquo;
          you set above. Add a variant here only if you want to offer additional choices with
          their own price and stock — shown to customers under the variation group(s) assigned
          above, or under the &ldquo;Variant option label&rdquo; you set above if none are assigned.
        </Text>
        <VariantManager
          productId={product.id}
          productSku={product.sku ?? ""}
          variants={variantsWithValueIds.filter((v) => !v.is_default_variant)}
          assignedGroups={assignedGroups}
        />
      </div>

      <div>
        <Heading level={3} className="mb-4">
          Images
        </Heading>
        <ImageManager productId={product.id} images={product.product_images ?? []} />
      </div>

      <div>
        <Heading level={3} className="mb-4">
          Hover Image
        </Heading>
        <HoverImageManager
          productId={product.id}
          imageUrl={product.hover_image_url ?? null}
        />
      </div>

      <div>
        <Heading level={3} className="mb-4">
          Before / After Result Banner
        </Heading>
        <BeforeAfterImageManager
          productId={product.id}
          imageUrl={product.before_after_image_url ?? null}
        />
      </div>
    </div>
  );
}
