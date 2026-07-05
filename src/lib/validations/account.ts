import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(7, "Enter a valid phone number"),
  line1: z.string().min(3, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(2),
  isDefault: z.boolean(),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type PasswordInput = z.infer<typeof passwordSchema>;
