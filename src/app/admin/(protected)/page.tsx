import { getDashboardStats } from "@/app/admin/(protected)/actions";
import { DashboardContent } from "@/components/admin/dashboard-content";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  return <DashboardContent initialStats={stats} />;
}
