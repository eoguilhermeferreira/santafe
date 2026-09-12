"use server";

import { createClient } from "@/lib/supabase/server";
import type { OrderWithItems } from "@/types/database.types";

export interface DashboardStats {
  productCount: number;
  pendingOrders: number;
  customerCount: number;
  revenue: number;
  recentOrders: OrderWithItems[];
}

/** Números e pedidos recentes do dashboard — pollado no client pra atualizar sozinho. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [
    { count: productCount },
    { count: pendingOrders },
    { count: customerCount },
    { data: paidOrders },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("delivery_status", "recebido"),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total").eq("payment_status", "pago"),
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const revenue = (paidOrders ?? []).reduce((sum, order) => sum + order.total, 0);

  return {
    productCount: productCount ?? 0,
    pendingOrders: pendingOrders ?? 0,
    customerCount: customerCount ?? 0,
    revenue,
    recentOrders: (recentOrders ?? []) as unknown as OrderWithItems[],
  };
}
