import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedBlogPosts } from "@/lib/data/blog";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { Reveal } from "@/components/animation/Reveal";

export const metadata: Metadata = {
  title: "Journal",
  description: "Stories and guides on natural ingredients, wellness, and ATOM PURE's products.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <Container className="py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Journal" }]} />
      <Heading level={1} className="mb-8">
        The Journal
      </Heading>

      {posts.length === 0 ? (
        <Text>No articles published yet — check back soon.</Text>
      ) : (
        <Reveal stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-2xl bg-beige-100">
                {post.cover_image_url ? (
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sage-400">
                    <span className="font-display text-sm">ATOM PURE</span>
                  </div>
                )}
              </div>
              <Heading level={4} className="text-base">
                {post.title}
              </Heading>
              {post.excerpt && <Text className="mt-1 line-clamp-2">{post.excerpt}</Text>}
            </Link>
          ))}
        </Reveal>
      )}
    </Container>
  );
}
