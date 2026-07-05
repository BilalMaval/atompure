import { z } from "zod";

export const variationGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  layout: z.enum(["horizontal", "vertical"]),
});
export type VariationGroupInput = z.infer<typeof variationGroupSchema>;

export const variationValueSchema = z.object({
  value: z.string().min(1, "Value is required"),
});
export type VariationValueInput = z.infer<typeof variationValueSchema>;
