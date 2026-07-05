import { createClient } from "@/lib/supabase/server";

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
}

export interface BlogPostDetail extends BlogPostListItem {
  body: string;
  seo_title: string | null;
  seo_description: string | null;
}

export async function getPublishedBlogPosts(): Promise<BlogPostListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image_url, published_at")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPublishedBlogPostBySlug(
  slug: string
): Promise<BlogPostDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, body, cover_image_url, published_at, seo_title, seo_description")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .maybeSingle();

  if (error) throw error;
  return data;
}
