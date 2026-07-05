import Link from "next/link";
import { getAdminBanners } from "@/lib/data/admin/banners";
import { Heading } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { AdminTable } from "@/components/admin/AdminTable";
import { BannerListRow } from "@/components/admin/BannerListRow";

export default async function AdminHomepageBannersPage() {
  const banners = await getAdminBanners();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Heading level={1}>Homepage Banners</Heading>
        <Link href="/admin/homepage-banners/new">
          <Button>New Banner</Button>
        </Link>
      </div>

      <AdminTable headers={["Banner", "Mode", "Status", "Order", ""]}>
        {banners.map((banner, index) => (
          <BannerListRow
            key={banner.id}
            banner={banner}
            isFirst={index === 0}
            isLast={index === banners.length - 1}
            prevNeighbor={banners[index - 1]}
            nextNeighbor={banners[index + 1]}
          />
        ))}
      </AdminTable>
    </div>
  );
}
