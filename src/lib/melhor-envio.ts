import "server-only";

import { onlyDigits } from "@/lib/format";
import { storeConfig } from "@/config/store";

/**
 * Cotação de frete via Melhor Envio (Correios, transportadoras etc.), por
 * CEP de destino + peso do carrinho. Requer MELHOR_ENVIO_TOKEN e
 * MELHOR_ENVIO_FROM_CEP configurados; sem eles, retorna null e quem chamar
 * cai pro frete fixo (`calculateShipping`) como reserva.
 *
 * MELHOR_ENVIO_SANDBOX=true usa o ambiente de testes (token de sandbox não
 * funciona na URL de produção, e vice-versa).
 */

interface ShippingQuote {
  cost: number;
  label: string;
}

// Caixa padrão (cm) usada pra todo produto, já que ainda não cadastramos
// dimensões por item — só o peso (weight_grams).
const DEFAULT_PACKAGE = { width: 16, height: 8, length: 20 };

function getBaseUrl(): string {
  return process.env.MELHOR_ENVIO_SANDBOX === "true"
    ? "https://sandbox.melhorenvio.com.br/api/v2"
    : "https://melhorenvio.com.br/api/v2";
}

export async function getMelhorEnvioQuote({
  toCep,
  weightGrams,
}: {
  toCep: string;
  weightGrams: number;
}): Promise<ShippingQuote | null> {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  const fromCep = process.env.MELHOR_ENVIO_FROM_CEP;
  if (!token || !fromCep) return null;

  const destinationCep = onlyDigits(toCep);
  if (destinationCep.length !== 8) return null;

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

    if (!response.ok) return null;

    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) return null;

    const valid = data.filter(
      (option): option is Record<string, unknown> =>
        Boolean(option) &&
        typeof option === "object" &&
        !("error" in option && (option as Record<string, unknown>).error) &&
        typeof (option as Record<string, unknown>).price !== "undefined"
    );
    if (valid.length === 0) return null;

    const cheapest = valid.reduce((best, current) =>
      Number(current.price) < Number(best.price) ? current : best
    );

    const companyName =
      (cheapest.company as { name?: string } | undefined)?.name?.trim() ?? "";
    const serviceName = String(cheapest.name ?? "Frete").trim();

    return {
      cost: Number(cheapest.price),
      label: companyName ? `${companyName} - ${serviceName}` : serviceName,
    };
  } catch (error) {
    console.error("Erro ao calcular frete no Melhor Envio", error);
    return null;
  }
}
