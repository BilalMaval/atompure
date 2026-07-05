import { z } from "zod";

export const storeSettingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  supportEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  supportPhone: z.string().optional(),
  gaMeasurementId: z.string().optional(),
  flatShippingRate: z.number().min(0),
  freeShippingThreshold: z.number().min(0),
  taxRatePercent: z.number().min(0).max(100),
});
export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;
