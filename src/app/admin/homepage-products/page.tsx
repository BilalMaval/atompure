import { getAllProductsBasic, getFeaturedProductIdsAdmin } from "@/lib/data/admin/homepage";
import { setFeaturedProducts } from "@/app/actions/admin/homepage";
import { Heading, Text } from "@/components/ui/Typography";
import { FeaturedItemsManager, type FeaturedItemOption } from "@/components/admin/FeaturedItemsManager";

export default async function HomepageProductsPage() {
  const [products, featuredIds] = await Promise.all([
    getAllProductsBasic(),
    getFeaturedProductIdsAdmin(),
  ]);

  const items: FeaturedItemOption[] = products.map((product) => ({
    id: product.id,
    label: product.name,
    imageUrl: [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]
      ?.url,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading level={1}>Atombook (Homepage Products)</Heading>
        <Text className="mt-1 text-sm text-charcoal-500">
          Choose which products appear in the &quot;The Atombook&quot; row on the homepage, and
          their order.
        </Text>
      </div>
      <FeaturedItemsManager allItems={items} initialFeaturedIds={featuredIds} onSave={setFeaturedProducts} />
    </div>
  );
}
