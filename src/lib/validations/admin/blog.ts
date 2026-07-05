import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().optional(),
  body: z.string().min(10, "Body is required"),
  coverImageUrl: z.string().optional(),
  isPublished: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});
export type BlogPostInput = z.infer<typeof blogPostSchema>;
