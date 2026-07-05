import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});
export type CategoryInput = z.infer<typeof categorySchema>;
