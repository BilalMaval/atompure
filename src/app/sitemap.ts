import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/data/products";
import { getPublishedBlogPosts } from "@/lib/data/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES = [
  { path: "", priority: 1 },
  { path: "/shop", priority: 0.9 },
  { path: "/blog", priority: 0.6 },
  { path: "/about", priority: 0.5 },
  { path: "/faq", priority: 0.4 },
  { path: "/contact", priority: 0.4 },
  { path: "/shipping-returns", priority: 0.3 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, posts] = await Promise.all([
    getProducts(),
    getCategories(),
    getPublishedBlogPosts(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    priority: route.priority,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/shop/${product.slug}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/shop?category=${category.slug}`,
    lastModified: new Date(),
    priority: 0.5,
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : new Date(),
    priority: 0.5,
  }));

  return [...staticEntries, ...productEntries, ...categoryEntries, ...blogEntries];
}
