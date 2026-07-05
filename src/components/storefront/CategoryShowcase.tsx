import Link from "next/link";
import { CategoryIcon } from "@/components/illustrations/CategoryIcon";
import { Heading } from "@/components/ui/Typography";
import type { FeaturedCategory } from "@/lib/data/homepage";

function iconForSlug(slug: string): "oil" | "oral" | "kitchen" {
  if (slug.includes("hair") || slug.includes("skin")) return "oil";
  if (slug.includes("oral") || slug.includes("teeth")) return "oral";
  return "kitchen";
}

export function CategoryShowcase({ categories }: { categories: FeaturedCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/shop?category=${category.slug}`}
          className="group flex flex-col items-center gap-4 rounded-[2rem] border border-beige-200 bg-cream-50 px-6 py-10 text-center transition-all duration-300 hover:-translate-y-1 hover:border-sage-300 hover:shadow-xl hover:shadow-sage-900/10"
        >
          <CategoryIcon
            variant={iconForSlug(category.slug)}
            className="h-16 w-16 text-sage-600 transition-transform duration-300 group-hover:scale-110"
          />
          <Heading level={4} className="text-lg">
            {category.name}
          </Heading>
        </Link>
      ))}
    </div>
  );
}
