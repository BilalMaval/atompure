import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen bg-cream-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminTopbar email={user?.email} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
