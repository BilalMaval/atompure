import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getApprovedReviews,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/data/products";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/storefront/Breadcrumbs";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Reveal } from "@/components/animation/Reveal";
import { ReviewForm } from "@/components/storefront/ReviewForm";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import { getMyWishlistProductIds } from "@/lib/data/account";
import { ProductView } from "@/components/storefront/ProductView";
import { Accordion } from "@/components/ui/Accordion";
import Image from "next/image";
import { toRichHtml } from "@/lib/markdown";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};

  const title = product.seo_title ?? product.name;
  const description =
    product.seo_description ?? product.description ?? undefined;
  const image = product.product_images?.[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const supabase = createClient();
  const [relatedProducts, reviews, { data: { user } }, wishlistIds] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getApprovedReviews(product.id),
    supabase.auth.getUser(),
    getMyWishlistProductIds(),
  ]);

  const images = [...(product.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: product.name },
  ];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images.map((img) => img.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: product.sale_price ?? product.base_price,
      availability: "https://schema.org/InStock",
    },
    ...(avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
  };

  return (
    <Container className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems, SITE_URL)),
        }}
      />

      <Breadcrumbs items={breadcrumbItems} />

      <div className="grid gap-10 lg:grid-cols-[4fr_3fr]">
        <ProductView
          product={product}
          images={images}
          galleryOverlay={
            <WishlistButton
              productId={product.id}
              initialWishlisted={wishlistIds.has(product.id)}
              isLoggedIn={Boolean(user)}
            />
          }
          badge={
            product.free_home_delivery ? (
              <span className="flex items-center gap-1.5 rounded-full bg-sage-600 px-3 py-1.5 text-xs font-semibold text-cream-50 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden
                >
                  <path d="M3 16.5V8.25a1.5 1.5 0 0 1 1.5-1.5h9a1.5 1.5 0 0 1 1.5 1.5v1.5h2.379a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 1 .439 1.061v3.129a1.5 1.5 0 0 1-1.5 1.5H19" />
                  <circle cx="7.5" cy="17.25" r="1.75" />
                  <circle cx="17" cy="17.25" r="1.75" />
                  <path d="M9.25 17.25h6M3 12.75h10.5" />
                </svg>
                Free Home Delivery
              </span>
            ) : undefined
          }
          aboveForm={
            <div>
              {product.category && (
                <Text className="mb-1 text-xs uppercase tracking-wide text-sage-600">
                  {product.category.name}
                </Text>
              )}
              <Heading level={1}>{product.name}</Heading>
              {avgRating && (
                <Text className="mt-1 text-sm">
                  {"★".repeat(Math.round(avgRating))}
                  {"☆".repeat(5 - Math.round(avgRating))} ({reviews.length} review
                  {reviews.length === 1 ? "" : "s"})
                </Text>
              )}
            </div>
          }
          belowForm={
            <Reveal>
              <Accordion
                items={[
                  ...(product.description
                    ? [{ title: "Description", content: <div className="rich-content" dangerouslySetInnerHTML={{ __html: toRichHtml(product.description) }} /> }]
                    : []),
                  ...(product.benefits
                    ? [{ title: "Benefits", content: <div className="rich-content" dangerouslySetInnerHTML={{ __html: toRichHtml(product.benefits) }} /> }]
                    : []),
                  ...(product.how_to_use
                    ? [{ title: "How to Use", content: <div className="rich-content" dangerouslySetInnerHTML={{ __html: toRichHtml(product.how_to_use) }} /> }]
                    : []),
                ]}
              />
            </Reveal>
          }
        />
      </div>

      {product.before_after_image_url && (
        <Reveal
          className="relative mt-16 w-full overflow-hidden rounded-2xl"
          style={{ height: `${product.before_after_image_height ?? 420}px` }}
        >
          <Image
            src={product.before_after_image_url}
            alt={`${product.name} before and after results`}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: product.before_after_image_position ?? "center" }}
          />
        </Reveal>
      )}

      <Reveal className="mt-16">
        <Heading level={3} className="mb-6">
          Customer Reviews
        </Heading>
        {reviews.length > 0 && (
          <div className="mb-8 flex flex-col gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-beige-200 pb-4">
                <Text className="text-sm">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                  {review.is_verified_purchase && (
                    <span className="ml-2 text-xs text-sage-600">
                      Verified Purchase
                    </span>
                  )}
                </Text>
                {review.body && <Text className="mt-1">{review.body}</Text>}
              </div>
            ))}
          </div>
        )}

        <div className="max-w-md">
          <Heading level={4} className="mb-3">
            Leave a Review
          </Heading>
          {user ? (
            <ReviewForm productId={product.id} productSlug={product.slug} />
          ) : (
            <Text>
              <Link href={`/login?redirect=/shop/${product.slug}`} className="text-sage-700 underline">
                Sign in
              </Link>{" "}
              to leave a review.
            </Text>
          )}
        </div>
      </Reveal>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <Heading level={3} className="mb-6">
            You May Also Like
          </Heading>
          <Reveal stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Reveal>
        </div>
      )}
    </Container>
  );
}
