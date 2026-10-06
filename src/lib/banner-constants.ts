import type { BannerSlot } from "@/types/database.types";

/** Legenda de cada local de banner, pra admin saber onde cada um aparece na loja. */
export const BANNER_SLOT_LABELS: Record<BannerSlot, string> = {
  topo: "Topo da loja (carrossel principal)",
  meio_esquerda: "Meio da home — esquerda (ao lado do banner de Bíblias)",
  meio_direita: "Meio da home — direita (ao lado do banner de Terços/Crucifixos)",
  quadrado_1: "Banner quadrado 1 (depois de Novidades)",
  quadrado_2: "Banner quadrado 2 (depois de Ofertas)",
};

export const BANNER_SLOT_ORDER: BannerSlot[] = [
  "topo",
  "meio_esquerda",
  "meio_direita",
  "quadrado_1",
  "quadrado_2",
];
