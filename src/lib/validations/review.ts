import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Select a rating").max(5),
  body: z.string().max(2000).optional(),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
