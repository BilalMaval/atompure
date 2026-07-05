"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSchema,
  passwordSchema,
  type ProfileInput,
  type PasswordInput,
} from "@/lib/validations/account";
import { updateProfile, updatePassword } from "@/app/actions/account";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Typography";

export function ProfileForm({ initialValues }: { initialValues: ProfileInput }) {
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
  });

  const passwordForm = useForm<PasswordInput>({ resolver: zodResolver(passwordSchema) });

  async function onProfileSubmit(values: ProfileInput) {
    setProfileError(null);
    setProfileSaved(false);
    const result = await updateProfile(values);
    if (!result.success) {
      setProfileError(result.error ?? "Something went wrong.");
      return;
    }
    setProfileSaved(true);
  }

  async function onPasswordSubmit(values: PasswordInput) {
    setPasswordError(null);
    setPasswordSaved(false);
    const result = await updatePassword(values);
    if (!result.success) {
      setPasswordError(result.error ?? "Something went wrong.");
      return;
    }
    passwordForm.reset();
    setPasswordSaved(true);
  }

  return (
    <div className="flex max-w-md flex-col gap-10">
      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="flex flex-col gap-4">
        <Heading level={3}>Profile</Heading>
        <Input placeholder="Full name" {...profileForm.register("fullName")} />
        {profileForm.formState.errors.fullName && (
          <p className="text-xs text-red-600">{profileForm.formState.errors.fullName.message}</p>
        )}
        <Input placeholder="Phone" {...profileForm.register("phone")} />
        {profileError && <p className="text-sm text-red-600">{profileError}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" className="w-fit">
            Save Profile
          </Button>
          {profileSaved && <span className="text-xs text-sage-700">Saved</span>}
        </div>
      </form>

      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
        <Heading level={3}>Change Password</Heading>
        <Input placeholder="New password" type="password" {...passwordForm.register("password")} />
        {passwordForm.formState.errors.password && (
          <p className="text-xs text-red-600">{passwordForm.formState.errors.password.message}</p>
        )}
        {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" className="w-fit">
            Update Password
          </Button>
          {passwordSaved && <span className="text-xs text-sage-700">Updated</span>}
        </div>
      </form>
    </div>
  );
}
