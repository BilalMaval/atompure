import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Typography";
import { clsx } from "@/lib/utils";
import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse ATOM PURE's organic, natural personal care products — oral care, hair care, and pure wellness oils.",
  alternates: { canonical: "/shop" },
};

const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string; search?: string };
}) {
  const sort = SORT_OPTIONS.find((o) => o.value === searchParams.sort)?.value;
  const [products, categories] = await Promise.all([
    getProducts({ categorySlug: searchParams.category, sort, search: searchParams.search }),
    getCategories(),
  ]);

  return (
    <Container className="py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <Heading level={1} className="mb-8">
        {searchParams.search ? `Search results for "${searchParams.search}"` : "Shop All Products"}
      </Heading>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/shop"
            className={clsx(
              "rounded-full border px-4 py-1.5 text-sm",
              !searchParams.category
                ? "border-sage-600 bg-sage-600 text-cream-50"
                : "border-beige-300 text-charcoal-600 hover:bg-beige-100"
            )}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/shop?category=${category.slug}`}
              className={clsx(
                "rounded-full border px-4 py-1.5 text-sm",
                searchParams.category === category.slug
                  ? "border-sage-600 bg-sage-600 text-cream-50"
                  : "border-beige-300 text-charcoal-600 hover:bg-beige-100"
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="flex gap-2 text-sm">
          {SORT_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={`/shop?${new URLSearchParams({
                ...(searchParams.category ? { category: searchParams.category } : {}),
                sort: option.value,
              }).toString()}`}
              className={clsx(
                "underline-offset-2",
                sort === option.value || (!sort && option.value === "name")
                  ? "text-sage-700 underline"
                  : "text-charcoal-500 hover:underline"
              )}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-charcoal-600">No products found.</p>
      ) : (
        <Reveal stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Reveal>
      )}
    </Container>
  );
}
