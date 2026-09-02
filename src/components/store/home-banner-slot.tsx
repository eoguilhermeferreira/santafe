"use client";

import { usePathname } from "next/navigation";

import { BannerCarousel } from "@/components/store/banner-carousel";
import type { Banner } from "@/types/database.types";

// O carrossel de banners fica acima do header só na home — o layout da
// loja é compartilhado com as outras páginas (categoria, carrinho,
// checkout etc.), que não devem ganhar esse banner.
export function HomeBannerSlot({ banners }: { banners: Banner[] }) {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <BannerCarousel banners={banners} />;
}
