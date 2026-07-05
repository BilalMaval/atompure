import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  revenue: number;
  orderCount: number;
  customerCount: number;
  lowStockVariants: { id: string; name: string; sku: string; stock_quantity: number; product_name: string }[];
  recentOrders: { id: string; order_number: string; total: number; status: string; created_at: string }[];
  revenueByDay: { date: string; revenue: number }[];
}

const LOW_STOCK_THRESHOLD = 10;

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [ordersRes, customersRes, lowStockRes, recentOrdersRes, revenueSeriesRes] = await Promise.all([
    supabase.from("orders").select("total, status").neq("status", "cancelled"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase
      .from("product_variants")
      .select("id, name, sku, stock_quantity, product:products(name)")
      .lt("stock_quantity", LOW_STOCK_THRESHOLD)
      .order("stock_quantity"),
    supabase
      .from("orders")
      .select("id, order_number, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("orders")
      .select("total, created_at")
      .neq("status", "cancelled")
      .gte("created_at", thirtyDaysAgo.toISOString()),
  ]);

  const revenue = (ordersRes.data ?? []).reduce((sum, o) => sum + Number(o.total), 0);

  const revenueByDayMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    revenueByDayMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const order of revenueSeriesRes.data ?? []) {
    const day = order.created_at.slice(0, 10);
    if (revenueByDayMap.has(day)) {
      revenueByDayMap.set(day, (revenueByDayMap.get(day) ?? 0) + Number(order.total));
    }
  }

  return {
    revenue,
    orderCount: ordersRes.data?.length ?? 0,
    customerCount: customersRes.count ?? 0,
    lowStockVariants: (lowStockRes.data ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      stock_quantity: v.stock_quantity,
      product_name: (v.product as unknown as { name: string } | null)?.name ?? "",
    })),
    recentOrders: recentOrdersRes.data ?? [],
    revenueByDay: Array.from(revenueByDayMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    })),
  };
}
