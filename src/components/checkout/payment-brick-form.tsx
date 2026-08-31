"use client";

import * as React from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

import { submitPayment, type SubmitPaymentResult } from "@/app/(store)/checkout/actions";
import type { PaymentMethod } from "@/types/database.types";

const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

if (typeof window !== "undefined" && publicKey) {
  initMercadoPago(publicKey, { locale: "pt-BR" });
}

type BrickPaymentType =
  | "atm"
  | "ticket"
  | "bank_transfer"
  | "creditCard"
  | "prepaidCard"
  | "debitCard"
  | "wallet_purchase"
  | "onboarding_credits";

const ALL_TYPES: BrickPaymentType[] = [
  "atm",
  "ticket",
  "bank_transfer",
  "creditCard",
  "prepaidCard",
  "debitCard",
  "wallet_purchase",
  "onboarding_credits",
];

const METHOD_TO_BRICK_TYPE: Record<PaymentMethod, BrickPaymentType> = {
  pix: "bank_transfer",
  boleto: "ticket",
  cartao_credito: "creditCard",
  cartao_debito: "debitCard",
};

/**
 * O tipo `paymentMethods` do SDK exige que a chave do método escolhido
 * (bankTransfer/creditCard/debitCard/ticket) esteja presente — não basta
 * usar só `types.excluded`. Por isso montamos o objeto por switch em vez
 * de um Record genérico.
 */
function buildPaymentMethodsConfig(method: PaymentMethod, excluded: BrickPaymentType[]) {
  switch (method) {
    case "pix":
      return { bankTransfer: "all" as const, types: { excluded } };
    case "cartao_credito":
      return { creditCard: "all" as const, types: { excluded } };
    case "cartao_debito":
      return { debitCard: "all" as const, types: { excluded } };
    case "boleto":
      return { ticket: "all" as const, types: { excluded } };
  }
}

export function PaymentBrickForm({
  orderId,
  amount,
  payerEmail,
  method,
  onResult,
}: {
  orderId: string;
  amount: number;
  payerEmail: string;
  method: PaymentMethod;
  onResult: (result: SubmitPaymentResult) => void;
}) {
  const includedType = METHOD_TO_BRICK_TYPE[method];

  if (!publicKey) {
    return (
      <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY não configurada. Defina as credenciais do
        Mercado Pago no .env para habilitar o pagamento.
      </p>
    );
  }

  return (
    <Payment
      key={method}
      initialization={{ amount, payer: { email: payerEmail } }}
      customization={{
        paymentMethods: buildPaymentMethodsConfig(
          method,
          ALL_TYPES.filter((t) => t !== includedType)
        ),
      }}
      onSubmit={async ({ formData }) => {
        const result = await submitPayment(orderId, formData as unknown as Record<string, unknown>);
        onResult(result);
        if (result.error) {
          throw new Error(result.error);
        }
      }}
      onError={(error) => {
        console.error("Erro no Payment Brick", error);
      }}
    />
  );
}
