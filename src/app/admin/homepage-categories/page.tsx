import { getAllCategoriesBasic, getFeaturedCategoryIdsAdmin } from "@/lib/data/admin/homepage";
import { setFeaturedCategories } from "@/app/actions/admin/homepage";
import { Heading, Text } from "@/components/ui/Typography";
import { FeaturedItemsManager, type FeaturedItemOption } from "@/components/admin/FeaturedItemsManager";

export default async function HomepageCategoriesPage() {
  const [categories, featuredIds] = await Promise.all([
    getAllCategoriesBasic(),
    getFeaturedCategoryIdsAdmin(),
  ]);

  const items: FeaturedItemOption[] = categories.map((category) => ({
    id: category.id,
    label: category.name,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading level={1}>Homepage Categories</Heading>
        <Text className="mt-1 text-sm text-charcoal-500">
          Choose which categories appear in the homepage category showcase, and their order.
        </Text>
      </div>
      <FeaturedItemsManager
        allItems={items}
        initialFeaturedIds={featuredIds}
        onSave={setFeaturedCategories}
      />
    </div>
  );
}
