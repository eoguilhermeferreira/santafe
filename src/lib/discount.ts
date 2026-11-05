import { storeConfig } from "@/config/store";
import type { PaymentMethod } from "@/types/database.types";

export interface DiscountResult {
  amount: number;
  label: string | null;
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
