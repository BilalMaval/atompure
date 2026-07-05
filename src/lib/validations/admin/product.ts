import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  categoryId: z.string().nullable().optional(),
  description: z.string().optional(),
  benefits: z.string().optional(),
  howToUse: z.string().optional(),
  sku: z.string().optional(),
  basePrice: z.number().min(0, "Price must be 0 or more"),
  stockQuantity: z.number().int().min(0, "Stock must be 0 or more"),
  baseVariantName: z.string().min(1, "Name is required").optional(),
  variantOptionLabel: z.string().min(1, "Label is required").optional(),
  salePrice: z.number().min(0, "Sale price must be 0 or more").nullable().optional(),
  deliveryCharge: z.number().min(0, "Delivery charge must be 0 or more").nullable().optional(),
  freeDeliveryMinPrice: z
    .number()
    .min(0, "Free delivery threshold must be 0 or more")
    .nullable()
    .optional(),
  freeHomeDelivery: z.boolean(),
  isActive: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const variantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().min(0, "Price must be 0 or more"),
  stockQuantity: z.number().int().min(0, "Stock must be 0 or more"),
  imageUrl: z.string().nullable().optional(),
});
export type VariantInput = z.infer<typeof variantSchema>;
