"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createCheckoutPreference } from "@/app/(store)/checkout/actions";
import { lookupOrder, type OrderLookupResult } from "@/app/(store)/pedido/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { DeliveryStatus, PaymentStatus } from "@/types/database.types";

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pendente: "Pagamento pendente",
  pago: "Pago",
  falhou: "Pagamento não concluído",
  reembolsado: "Reembolsado",
};

const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  recebido: "Pedido recebido",
  preparando: "Preparando",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function OrderLookup({ initialOrderNumber }: { initialOrderNumber?: string }) {
  const [orderNumber, setOrderNumber] = React.useState(initialOrderNumber ?? "");
  const [email, setEmail] = React.useState("");
  const [result, setResult] = React.useState<OrderLookupResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPaying, setIsPaying] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);
    const response = await lookupOrder({ orderNumber, email });
    setResult(response);
    setIsLoading(false);
    if (response.error) toast.error(response.error);
  }

  async function handlePayAgain(orderId: string) {
    setIsPaying(true);
    const preference = await createCheckoutPreference(orderId);
    if (preference.error || !preference.initPoint) {
      setIsPaying(false);
      toast.error(preference.error ?? "Não foi possível iniciar o pagamento.");
      return;
    }
    window.location.href = preference.initPoint;
  }

  const order = result?.order;

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="orderNumber" className="mb-1.5 block">
            Número do pedido
          </Label>
          <Input
            id="orderNumber"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            inputMode="numeric"
            placeholder="Ex: 1024"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="mb-1.5 block">
            E-mail usado na compra
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          Consultar pedido
        </Button>
      </form>

      {order && (
        <Card className="space-y-3 p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold">Pedido #{order.orderNumber}</h2>
            <span className="text-sm font-medium">{PAYMENT_STATUS_LABEL[order.paymentStatus]}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Feito em {formatDateTime(order.createdAt)} — {DELIVERY_STATUS_LABEL[order.deliveryStatus]}
          </p>

          <ul className="space-y-1.5 border-t border-border pt-3 text-sm">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between gap-2">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.productName}
                  {item.variationValue ? ` (${item.variationValue})` : ""}
                </span>
                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{order.shippingMethod ?? "Frete"}</span>
              <span>{formatPrice(order.shippingCost)}</span>
            </div>
          </div>

          <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>

          {(order.paymentStatus === "pendente" || order.paymentStatus === "falhou") && (
            <Button onClick={() => handlePayAgain(order.id)} className="w-full" disabled={isPaying}>
              {isPaying && <Loader2 className="size-4 animate-spin" />}
              Pagar agora
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
