"use client";

import { useRouter } from "next/navigation";
import { deleteBanner } from "@/app/actions/admin/banners";
import { Button } from "@/components/ui/Button";

export function DeleteBannerButton({ bannerId }: { bannerId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm("Delete this banner?")) return;
    await deleteBanner(bannerId);
    router.push("/admin/homepage-banners");
  }

  return (
    <Button variant="outline" onClick={handleDelete} className="border-red-600 text-red-600 hover:bg-red-50">
      Delete Banner
    </Button>
  );
}
