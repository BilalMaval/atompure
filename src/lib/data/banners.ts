import { createClient } from "@/lib/supabase/server";

export interface HomepageBanner {
  id: string;
  sort_order: number;
  is_active: boolean;
  mode: "split" | "image";
  custom_link: string | null;
  heading: string | null;
  heading_size: "sm" | "md" | "lg" | "xl";
  heading_position: "left" | "center" | "right";
  background_color: "sage" | "cream" | "beige";
  background_image_url: string | null;
  image_url: string | null;
  image_position: "left" | "right";
  button_text: string;
  product: {
    name: string;
    slug: string;
    base_price: number;
    product_images: { url: string; sort_order: number }[];
  } | null;
  category: { name: string; slug: string } | null;
}

export async function getActiveHomepageBanners(): Promise<HomepageBanner[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("homepage_banners")
    .select(
      "id, sort_order, is_active, mode, custom_link, heading, heading_size, heading_position, background_color, background_image_url, image_url, image_position, button_text, product:products(name, slug, base_price, product_images(url, sort_order)), category:categories(name, slug)"
    )
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as unknown as HomepageBanner[];
}

export function resolveBannerLink(banner: Pick<HomepageBanner, "product" | "category" | "custom_link">): string {
  if (banner.product) return `/shop/${banner.product.slug}`;
  if (banner.category) return `/shop?category=${banner.category.slug}`;
  return banner.custom_link || "/shop";
}
