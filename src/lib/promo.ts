import type { Product } from "@/types/database.types";

/**
 * Preço promocional "de verdade": null se não tiver promoção, ou se ela
 * tiver prazo e esse prazo já tiver passado — a promoção desliga sozinha,
 * sem a loja precisar lembrar de tirar o promo_price na mão.
 */
export function getEffectivePromoPrice(
  product: Pick<Product, "promo_price" | "promo_price_until">
): number | null {
  if (product.promo_price == null) return null;
  if (product.promo_price_until && new Date(product.promo_price_until) <= new Date()) {
    return null;
  }
  return product.promo_price;
}
