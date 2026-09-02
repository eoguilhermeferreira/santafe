import { storeConfig } from "@/config/store";

/**
 * Frete simplificado (sem integração com transportadora ainda): valor
 * fixo pra qualquer lugar do Brasil.
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
