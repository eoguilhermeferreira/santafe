import "server-only";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

import type { PaymentMethod, PaymentStatus } from "@/types/database.types";

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

/** Usado pelo webhook para buscar o pagamento real a partir do id notificado. */
export function getPaymentClient(): Payment {
  return new Payment(getClient());
}

/**
 * Checkout Pro: gera a preferência que leva ao `init_point` (URL da página
 * de pagamento hospedada pelo Mercado Pago) — ver `createCheckoutPreference`
 * em app/(store)/checkout/actions.ts.
 */
export function getPreferenceClient(): Preference {
  return new Preference(getClient());
}

/** Mapeia o tipo de pagamento usado de fato (vindo do webhook) pro nosso enum. */
export function mapMercadoPagoPaymentType(paymentTypeId: string | undefined): PaymentMethod | null {
  switch (paymentTypeId) {
    case "credit_card":
      return "cartao_credito";
    case "debit_card":
      return "cartao_debito";
    case "ticket":
      return "boleto";
    case "bank_transfer":
      return "pix";
    default:
      return null;
  }
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
