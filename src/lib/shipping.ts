import { storeConfig } from "@/config/store";

/**
 * Frete fixo, usado como estimativa antes do CEP (carrinho) e como reserva
 * quando o Melhor Envio não está configurado ou não consegue cotar
 * (ver `estimateShipping` em app/(store)/checkout/actions.ts).
 */
export function calculateShipping(): {
  cost: number;
  label: string;
} {
  const { flatRateCents } = storeConfig.shipping;

  return {
    cost: flatRateCents / 100,
    label: "Frete padrão",
  };
}
