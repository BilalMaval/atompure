import dynamic from "next/dynamic";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/animation/Reveal";
import { getProducts, getCategories } from "@/lib/data/products";
import { ProductCard } from "@/components/storefront/ProductCard";
import { TrustBadges } from "@/components/storefront/TrustBadges";
import { Testimonials } from "@/components/storefront/Testimonials";
import { NewsletterForm } from "@/components/storefront/NewsletterForm";
import { CategoryShowcase } from "@/components/storefront/CategoryShowcase";
import { HomepageBanner } from "@/components/storefront/HomepageBanner";
import { getActiveHomepageBanners } from "@/lib/data/banners";
import {
  getFeaturedHomepageProducts,
  getFeaturedHomepageCategories,
  getActiveResultsGallery,
} from "@/lib/data/homepage";
import { ResultsGallery } from "@/components/storefront/ResultsGallery";
import Image from "next/image";

const HeroScene = dynamic(
  () => import("@/components/animation/HeroScene").then((mod) => mod.HeroScene),
  { ssr: false }
);

export default async function Home() {
  const [allProducts, featuredProducts, banners, featuredCategories, allCategories, resultsGallery] =
    await Promise.all([
      getProducts(),
      getFeaturedHomepageProducts(),
      getActiveHomepageBanners(),
      getFeaturedHomepageCategories(),
      getCategories(),
      getActiveResultsGallery(),
    ]);

  const atombookProducts = featuredProducts.length ? featuredProducts : allProducts.slice(0, 3);
  const showcaseCategories = featuredCategories.length
    ? featuredCategories
    : allCategories.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <div className="relative -mt-14 flex min-h-[680px] items-center overflow-hidden">
        <HeroScene />
        <Container className="relative z-10 pt-32 pb-24">
          <Reveal stagger className="flex flex-col items-start gap-6">
            <Badge className="bg-white/10 text-sage-200 backdrop-blur">
              ATOM PURE LIFE
            </Badge>
            <Heading level={1} className="!text-cream-50 flex flex-col items-start text-[68.4px] leading-[0.95] sm:text-[91.2px] lg:text-[121.6px]">
              <span>Atomic</span>
              <span>Level</span>
              <span>Purity.</span>
            </Heading>
          </Reveal>
        </Container>
      </div>

      {/* Short statement band */}
      <Container className="py-20">
        <Reveal stagger className="flex flex-col items-center gap-2 text-center">
          <Heading level={2} className="font-display text-[clamp(2.5rem,8vw,95px)] leading-tight">
            We started to make life pure.
          </Heading>
          <Heading level={2} className="font-display text-[clamp(2.5rem,8vw,95px)] leading-tight text-sage-700">
            Atom Pure Life.
          </Heading>
          <Heading level={2} className="font-display text-[clamp(2.5rem,8vw,95px)] leading-tight">
            100% Pure — 0% Chemicals.
          </Heading>
        </Reveal>
      </Container>

      {/* Products, exactly 3 in a single row */}
      <Container className="pt-12 pb-0">
        <Reveal className="mb-10 flex items-end justify-between">
          <Heading level={2} className="font-display text-[clamp(2.5rem,8vw,95px)] !font-light leading-tight">
            The Atombook
          </Heading>
          <Link href="/shop" className="text-sm text-sage-700 underline">
            View all
          </Link>
        </Reveal>
        <Reveal stagger className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {atombookProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Reveal>
      </Container>

      {/* Trust badges */}
      <div className="bg-cream-100 py-20">
        <Container>
          <Reveal>
            <TrustBadges />
          </Reveal>
        </Container>
      </div>

      {/* Full-width banner */}
      <Reveal className="relative mt-1 flex h-[420px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-sage-700 via-sage-600 to-charcoal-900">
        <Image
          src="/logo-mark.png"
          alt=""
          width={384}
          height={384}
          className="invert absolute -right-20 -top-20 h-96 w-96 object-contain opacity-10"
        />
        <Image
          src="/logo-mark.png"
          alt=""
          width={320}
          height={320}
          className="invert absolute -bottom-24 -left-16 h-80 w-80 object-contain opacity-10"
        />
        <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
          <Heading level={2} className="font-display text-[clamp(2.5rem,8vw,95px)] leading-tight !text-cream-50">
            Atom Pure Life.
          </Heading>
          <Text className="max-w-2xl text-lg !text-cream-100 sm:text-xl">
            &ldquo;To be successful, you need to look good. To look good, you need to feel good.
            To feel good, you need a pure life. And for a pure life, you need Atom Pure
            Life.&rdquo;
          </Text>
          <Text className="font-display text-lg !text-cream-50 sm:text-xl">
            Pure to the last Atom.
          </Text>
        </div>
      </Reveal>

      {/* Category showcase */}
      <Container className="py-20">
        <Reveal stagger>
          <CategoryShowcase categories={showcaseCategories} />
        </Reveal>
      </Container>

      {/* Homepage banners, admin-editable from /admin/homepage-banners */}
      <Container className="flex flex-col gap-2 pt-1 pb-0">
        {banners.map((banner) => (
          <Reveal key={banner.id} className="overflow-hidden rounded-2xl">
            <HomepageBanner banner={banner} />
          </Reveal>
        ))}
      </Container>

      {/* Our story */}
      <Container className="py-20">
        <Reveal className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="font-display text-[57.6px] font-light leading-[1.05] text-charcoal-900 sm:text-[72px]">
              Why Atom Pure.
            </h2>
            <p className="whitespace-nowrap font-display text-[23.4px] font-light leading-snug text-charcoal-700 sm:text-[29.3px]">
              We started this journey to make life 100% pure.
            </p>
            <Text className="max-w-md text-[21.6px] leading-relaxed text-charcoal-600">
              At Atom Pure, purity isn&apos;t a marketing word — it&apos;s our manufacturing
              standard. Every product we make is cold-pressed, slow-extracted, and free from
              synthetic additives, so nothing comes between you and nature.
            </Text>
            <Link
              href="/shop"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-charcoal-900 px-8 py-3.5 text-sm font-semibold tracking-wide text-cream-50 transition hover:bg-sage-700"
            >
              Shop Now
            </Link>
          </div>
          <div className="flex aspect-square items-center justify-center rounded-[2rem] bg-gradient-to-br from-sage-100 via-cream-100 to-beige-100">
            <Image src="/logo-mark.png" alt="Atom Pure" width={160} height={160} className="h-40 w-40 object-contain" />
          </div>
        </Reveal>
      </Container>

      {/* Testimonials */}
      <div className="bg-cream-100 pt-14 pb-10">
        <Reveal className="mb-10 px-4 text-center">
          <Heading level={2} className="font-display text-[clamp(2.5rem,8vw,95px)] leading-tight">
            What Customers Are Saying
          </Heading>
        </Reveal>
        <Testimonials />
      </div>

      {/* Real results, admin-editable from /admin/results-gallery */}
      {resultsGallery.length > 0 && (
        <div className="bg-cream-100 pt-4 pb-20">
          <ResultsGallery images={resultsGallery} />
        </div>
      )}

      {/* Newsletter */}
      <Container className="flex flex-col items-center gap-4 py-20 text-center">
        <Reveal className="flex flex-col items-center gap-4">
          <Heading level={2} className="font-display text-[clamp(2.5rem,8vw,95px)] leading-tight">
            Join the Atom Pure
          </Heading>
          <Text>Get notified about new products and special offers.</Text>
          <NewsletterForm />
        </Reveal>
      </Container>
    </>
  );
}
