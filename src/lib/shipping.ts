import { storeConfig } from "@/config/store";

/**
 * Frete simplificado (sem integração com transportadora): valor fixo,
 * já que a entrega é restrita a Avaré/SP.
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
