import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, base_price, product_images(url, sort_order)")
    .eq("is_active", true)
    .ilike("name", `%${query}%`)
    .limit(6);

  if (error) {
    return NextResponse.json({ results: [] }, { status: 500 });
  }

  const results = (data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: product.base_price,
    imageUrl: [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]
      ?.url ?? null,
  }));

  return NextResponse.json({ results });
}
