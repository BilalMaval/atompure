"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { toggleBannerActive, reorderBanner } from "@/app/actions/admin/banners";

interface BannerRow {
  id: string;
  sort_order: number;
  is_active: boolean;
  mode: string;
  heading: string | null;
  product: { name: string } | null;
}

export function BannerListRow({
  banner,
  isFirst,
  isLast,
  prevNeighbor,
  nextNeighbor,
}: {
  banner: BannerRow;
  isFirst: boolean;
  isLast: boolean;
  prevNeighbor?: { id: string; sort_order: number };
  nextNeighbor?: { id: string; sort_order: number };
}) {
  const router = useRouter();

  async function handleToggle() {
    await toggleBannerActive(banner.id, !banner.is_active);
    router.refresh();
  }

  async function handleMove(direction: -1 | 1) {
    const neighbor = direction === -1 ? prevNeighbor : nextNeighbor;
    if (!neighbor) return;
    await reorderBanner(banner.id, neighbor.sort_order);
    await reorderBanner(neighbor.id, banner.sort_order);
    router.refresh();
  }

  return (
    <tr>
      <td className="px-4 py-3">{banner.heading || banner.product?.name || "Untitled"}</td>
      <td className="px-4 py-3 capitalize">{banner.mode}</td>
      <td className="px-4 py-3">
        <button onClick={handleToggle} className={banner.is_active ? "text-sage-700" : "text-charcoal-400"}>
          {banner.is_active ? "Active" : "Hidden"}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2 text-xs">
          <button disabled={isFirst} onClick={() => handleMove(-1)} className="disabled:opacity-30">
            ↑
          </button>
          <button disabled={isLast} onClick={() => handleMove(1)} className="disabled:opacity-30">
            ↓
          </button>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <Link href={`/admin/homepage-banners/${banner.id}`} className="text-sage-700 hover:underline">
          Edit
        </Link>
      </td>
    </tr>
  );
}
