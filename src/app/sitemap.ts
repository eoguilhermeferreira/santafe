import type { MetadataRoute } from "next";

import { storeConfig } from "@/config/store";
import { createClient } from "@/lib/supabase/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = storeConfig.siteUrl;
  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/produtos`, changeFrequency: "daily", priority: 0.8 },
  ];

  // Sem as credenciais do Supabase configuradas (ex: build antes de definir
  // as env vars na Vercel) o sitemap ainda gera com as rotas estáticas, em
  // vez de derrubar o build inteiro.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return staticEntries;
  }

  const supabase = createClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("is_active", true),
    supabase.from("categories").select("slug"),
  ]);

  return [
    ...staticEntries,
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
