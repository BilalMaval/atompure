import { createClient } from "@/lib/supabase/server";
import { Heading } from "@/components/ui/Typography";
import { ProfileForm } from "@/components/storefront/ProfileForm";

export default async function AccountProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user?.id)
    .maybeSingle();

  return (
    <div>
      <Heading level={1} className="mb-6">
        My Profile
      </Heading>
      <ProfileForm
        initialValues={{
          fullName: profile?.full_name ?? "",
          phone: profile?.phone ?? "",
        }}
      />
    </div>
  );
}
