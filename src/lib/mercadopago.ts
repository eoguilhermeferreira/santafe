import "server-only";
import { MercadoPagoConfig, Payment } from "mercadopago";

import type { PaymentStatus } from "@/types/database.types";

let client: MercadoPagoConfig | null = null;

function getClient(): MercadoPagoConfig {
  if (!client) {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado.");
    }
    client = new MercadoPagoConfig({ accessToken });
  }
  return client;
}

export function getPaymentClient(): Payment {
  return new Payment(getClient());
}

/** Mapeia o status do Mercado Pago para o enum payment_status do banco. */
export function mapMercadoPagoStatus(status: string): PaymentStatus {
  switch (status) {
    case "approved":
      return "pago";
    case "refunded":
    case "charged_back":
      return "reembolsado";
    case "rejected":
    case "cancelled":
      return "falhou";
    case "pending":
    case "in_process":
    case "in_mediation":
    case "authorized":
    default:
      return "pendente";
  }
}
