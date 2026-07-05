import { getResultsGalleryAdmin } from "@/lib/data/admin/homepage";
import { Heading, Text } from "@/components/ui/Typography";
import { ResultsGalleryManager } from "@/components/admin/ResultsGalleryManager";

export default async function ResultsGalleryPage() {
  const images = await getResultsGalleryAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading level={1}>Results Gallery</Heading>
        <Text className="mt-1 text-sm text-charcoal-500">
          Manage the real-results image row shown at the bottom of the homepage.
        </Text>
      </div>
      <ResultsGalleryManager images={images} />
    </div>
  );
}
