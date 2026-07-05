import { getVariationGroups } from "@/lib/data/admin/variations";
import { Heading, Text } from "@/components/ui/Typography";
import { VariationGroupsManager } from "@/components/admin/VariationGroupsManager";

export default async function AdminVariationsPage() {
  const groups = await getVariationGroups();

  return (
    <div className="flex flex-col gap-6">
      <Heading level={1}>Variations</Heading>
      <Text className="max-w-2xl text-sm text-charcoal-500">
        Create reusable variation groups here (e.g. &ldquo;Size&rdquo; with values &ldquo;Small&rdquo;, &ldquo;Medium&rdquo;, &ldquo;Large&rdquo;,
        or &ldquo;Color&rdquo; with &ldquo;Red&rdquo;, &ldquo;Blue&rdquo;). Set each group&apos;s display layout and order, then go to
        a product&apos;s edit page to assign one or more groups to it and create the actual
        variants (combinations of values) for that product.
      </Text>
      <VariationGroupsManager groups={groups} />
    </div>
  );
}
