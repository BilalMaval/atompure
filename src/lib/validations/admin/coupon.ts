import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().min(2, "Code is required").toUpperCase(),
  discountType: z.enum(["percent", "fixed"]),
  value: z.number().positive("Value must be greater than 0"),
  usageLimit: z.string().optional(),
  expiresAt: z.string().optional(),
});
export type CouponInput = z.infer<typeof couponSchema>;
