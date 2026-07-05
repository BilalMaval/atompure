"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  addressSchema,
  passwordSchema,
  profileSchema,
  type AddressInput,
  type PasswordInput,
  type ProfileInput,
} from "@/lib/validations/account";

interface ActionResult {
  success: boolean;
  error?: string;
}

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

function toAddressRow(input: AddressInput, profileId: string) {
  return {
    profile_id: profileId,
    full_name: input.fullName,
    phone: input.phone,
    line1: input.line1,
    line2: input.line2 ?? null,
    city: input.city,
    province: input.province ?? null,
    postal_code: input.postalCode ?? null,
    country: input.country,
    is_default: input.isDefault,
  };
}

export async function createAddress(input: AddressInput): Promise<ActionResult> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const { supabase, user } = await requireUser();

  if (parsed.data.isDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("profile_id", user.id);
  }

  const { error } = await supabase.from("addresses").insert(toAddressRow(parsed.data, user.id));
  if (error) return { success: false, error: error.message };

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function updateAddress(id: string, input: AddressInput): Promise<ActionResult> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const { supabase, user } = await requireUser();

  if (parsed.data.isDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("profile_id", user.id);
  }

  const { error } = await supabase
    .from("addresses")
    .update(toAddressRow(parsed.data, user.id))
    .eq("id", id)
    .eq("profile_id", user.id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("addresses").delete().eq("id", id).eq("profile_id", user.id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/account/profile");
  return { success: true };
}

export async function updatePassword(input: PasswordInput): Promise<ActionResult> {
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const { supabase } = await requireUser();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
