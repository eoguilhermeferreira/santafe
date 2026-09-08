import "server-only";

import { onlyDigits } from "@/lib/format";
import { storeConfig } from "@/config/store";

/**
 * Cotação de frete via Melhor Envio, por CEP de destino + peso do carrinho.
 * Requer MELHOR_ENVIO_TOKEN e MELHOR_ENVIO_FROM_CEP configurados; sem eles
 * (ou se a API falhar), retorna lista vazia e quem chamar cai pro frete
 * fixo (`calculateShipping`) como reserva.
 *
 * MELHOR_ENVIO_SANDBOX=true usa o ambiente de testes (token de sandbox não
 * funciona na URL de produção, e vice-versa).
 */

export interface ShippingOption {
  id: string;
  label: string;
  cost: number;
}

// Só essas transportadoras aparecem pro cliente, no máximo 2 serviços
// (os mais baratos) de cada uma — combinado com a loja.
const ALLOWED_COMPANIES = ["correios", "jadlog", "loggi"];
const MAX_PER_COMPANY = 2;

// Caixa padrão (cm) usada pra todo produto, já que ainda não cadastramos
// dimensões por item — só o peso (weight_grams).
const DEFAULT_PACKAGE = { width: 16, height: 8, length: 20 };

function getBaseUrl(): string {
  return process.env.MELHOR_ENVIO_SANDBOX === "true"
    ? "https://sandbox.melhorenvio.com.br/api/v2"
    : "https://melhorenvio.com.br/api/v2";
}

export async function getMelhorEnvioOptions({
  toCep,
  weightGrams,
}: {
  toCep: string;
  weightGrams: number;
}): Promise<ShippingOption[]> {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  const fromCep = process.env.MELHOR_ENVIO_FROM_CEP;
  if (!token || !fromCep) return [];

  const destinationCep = onlyDigits(toCep);
  if (destinationCep.length !== 8) return [];

  try {
    const response = await fetch(`${getBaseUrl()}/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": `${storeConfig.name} (${storeConfig.contact.email})`,
      },
      body: JSON.stringify({
        from: { postal_code: onlyDigits(fromCep) },
        to: { postal_code: destinationCep },
        package: {
          weight: Math.max(weightGrams, 1) / 1000,
          ...DEFAULT_PACKAGE,
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) return [];

    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) return [];

    const valid = data.filter(
      (option): option is Record<string, unknown> =>
        Boolean(option) &&
        typeof option === "object" &&
        !("error" in option && (option as Record<string, unknown>).error) &&
        typeof (option as Record<string, unknown>).price !== "undefined"
    );

    const allowed = valid.filter((option) => {
      const companyName = (option.company as { name?: string } | undefined)?.name ?? "";
      return ALLOWED_COMPANIES.includes(companyName.trim().toLowerCase());
    });

    const byCompany = new Map<string, Record<string, unknown>[]>();
    for (const option of allowed) {
      const companyName = (option.company as { name?: string } | undefined)?.name?.trim() ?? "";
      const group = byCompany.get(companyName) ?? [];
      group.push(option);
      byCompany.set(companyName, group);
    }

    const options: ShippingOption[] = [];
    for (const [companyName, group] of byCompany) {
      const cheapestFirst = group.sort((a, b) => Number(a.price) - Number(b.price));
      for (const option of cheapestFirst.slice(0, MAX_PER_COMPANY)) {
        const serviceName = String(option.name ?? "Frete").trim();
        options.push({
          id: String(option.id),
          label: companyName ? `${companyName} - ${serviceName}` : serviceName,
          cost: Number(option.price),
        });
      }
    }

    return options.sort((a, b) => a.cost - b.cost);
  } catch (error) {
    console.error("Erro ao calcular frete no Melhor Envio", error);
    return [];
  }
}
