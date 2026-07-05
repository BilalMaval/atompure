import { z } from "zod";

export const bannerSchema = z.object({
  mode: z.enum(["split", "image"]),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  customLink: z.string().optional(),
  heading: z.string().optional(),
  headingSize: z.enum(["sm", "md", "lg", "xl"]),
  headingPosition: z.enum(["left", "center", "right"]),
  backgroundColor: z.enum(["sage", "cream", "beige"]),
  backgroundImageUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  imagePosition: z.enum(["left", "right"]),
  buttonText: z.string().min(1, "Button text is required"),
  isActive: z.boolean(),
});
export type BannerInput = z.infer<typeof bannerSchema>;
