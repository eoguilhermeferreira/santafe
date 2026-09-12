"use client";

import * as React from "react";
import { ClipboardList, DollarSign, Package, Users } from "lucide-react";

import { getDashboardStats, type DashboardStats } from "@/app/admin/(protected)/actions";
import { RecentOrders } from "@/components/admin/recent-orders";
import { StatCard } from "@/components/admin/stat-card";
import { formatPrice } from "@/lib/format";

const POLL_INTERVAL_MS = 8000;

/** Mesmo esquema de polling da lista de pedidos — atualiza sozinho, sem F5. */
export function DashboardContent({ initialStats }: { initialStats: DashboardStats }) {
  const [stats, setStats] = React.useState(initialStats);

  React.useEffect(() => {
    const interval = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      const fresh = await getDashboardStats();
      setStats(fresh);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Faturamento (pago)" value={formatPrice(stats.revenue)} icon={DollarSign} />
        <StatCard label="Pedidos novos" value={String(stats.pendingOrders)} icon={ClipboardList} />
        <StatCard label="Produtos cadastrados" value={String(stats.productCount)} icon={Package} />
        <StatCard label="Clientes cadastrados" value={String(stats.customerCount)} icon={Users} />
      </div>
      <RecentOrders orders={stats.recentOrders} />
    </div>
  );
}
