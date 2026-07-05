import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  line1: z.string().min(3, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(2),
  paymentMethod: z.literal("cod"),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
  saveAddress: z.boolean().optional(),
  addressId: z.string().uuid().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const cartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
  imageUrl: z.string().nullable().optional(),
  productName: z.string().optional(),
  variantName: z.string().optional(),
});

export const createOrderSchema = z.object({
  checkout: checkoutSchema,
  items: z.array(cartItemSchema).min(1, "Your cart is empty"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
