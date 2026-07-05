"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { blogPostSchema, type BlogPostInput } from "@/lib/validations/admin/blog";

interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

function toRow(input: BlogPostInput) {
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt ?? null,
    body: input.body,
    cover_image_url: input.coverImageUrl ?? null,
    published_at: input.isPublished ? new Date().toISOString() : null,
    seo_title: input.seoTitle ?? null,
    seo_description: input.seoDescription ?? null,
  };
}

export async function createBlogPost(input: BlogPostInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .insert(toRow(parsed.data))
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true, id: data.id };
}

export async function updateBlogPost(id: string, input: BlogPostInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const supabase = createClient();

  // Preserve original published_at if already published and still published,
  // so re-saving doesn't bump the publish date.
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();

  const row = toRow(parsed.data);
  if (parsed.data.isPublished && existing?.published_at) {
    row.published_at = existing.published_at;
  }

  const { error } = await supabase
    .from("blog_posts")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.data.slug}`);
  return { success: true, id };
}

export async function deleteBlogPost(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}
