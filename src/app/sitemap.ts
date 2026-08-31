import type { MetadataRoute } from "next";

import { storeConfig } from "@/config/store";
import { createClient } from "@/lib/supabase/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const base = storeConfig.siteUrl;

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("is_active", true),
    supabase.from("categories").select("slug"),
  ]);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/produtos`, changeFrequency: "daily", priority: 0.8 },
    ...(categories ?? []).map((category) => ({
      url: `${base}/categoria/${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    ...(products ?? []).map((product) => ({
      url: `${base}/produto/${product.slug}`,
      lastModified: product.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
