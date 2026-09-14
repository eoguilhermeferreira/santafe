import { BannerManager } from "@/app/admin/(protected)/banners/banner-manager";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Banners" };

export default async function AdminBannersPage() {
  const supabase = await createClient();
  const [{ data: banners }, { data: categories }] = await Promise.all([
    supabase.from("banners").select("*").order("display_order", { ascending: true }),
    supabase.from("categories").select("id, name, slug").order("display_order", { ascending: true }),
  ]);

  return <BannerManager banners={banners ?? []} categories={categories ?? []} />;
}
