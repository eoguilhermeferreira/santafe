import { storeConfig } from "@/config/store";
import { formatPrice } from "@/lib/format";
import type { PaymentMethod } from "@/types/database.types";

export interface DiscountResult {
  amount: number;
  label: string | null;
}

export interface CouponResult extends DiscountResult {
  error?: string;
}

/**
 * Desconto automático de quem paga no Pix, sobre o subtotal dos produtos
 * (não sobre o frete). Mesma função usada no preview do checkout (cliente)
 * e na criação do pedido (servidor), pra nunca ficar dessincronizado.
 */
export function calculatePixDiscount(subtotal: number, paymentMethod: PaymentMethod): DiscountResult {
  if (paymentMethod !== "pix") return { amount: 0, label: null };

  const percent = storeConfig.payments.pixDiscountPercent;
  const amount = Math.round(subtotal * (percent / 100) * 100) / 100;
  return { amount, label: `Desconto Pix (${percent}%)` };
}

/**
 * Cupom de desconto — válido só dentro da faixa de subtotal configurada em
 * cada cupom (ver storeConfig.coupons). Mesma função usada no preview do
 * checkout e na criação do pedido no servidor.
 */
export function calculateCouponDiscount(code: string, subtotal: number): CouponResult {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { amount: 0, label: null };

  const coupon = storeConfig.coupons.find((c) => c.code === normalized);
  if (!coupon) return { amount: 0, label: null, error: "Cupom inválido." };

  if (subtotal < coupon.minSubtotal || subtotal > coupon.maxSubtotal) {
    return {
      amount: 0,
      label: null,
      error: `Esse cupom vale só pra compras entre ${formatPrice(coupon.minSubtotal)} e ${formatPrice(coupon.maxSubtotal)}.`,
    };
  }

  const amount = Math.round(subtotal * (coupon.percent / 100) * 100) / 100;
  return { amount, label: `Cupom ${coupon.code} (${coupon.percent}%)` };
}

/** Soma o desconto do Pix com o do cupom (os dois podem valer juntos). */
export function combineDiscounts(...discounts: DiscountResult[]): DiscountResult {
  const amount = discounts.reduce((sum, d) => sum + d.amount, 0);
  const label = discounts
    .map((d) => d.label)
    .filter((label): label is string => Boolean(label))
    .join(" + ");
  return { amount, label: label || null };
}
