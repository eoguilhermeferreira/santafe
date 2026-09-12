"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createCheckoutPreference } from "@/app/(store)/checkout/actions";
import { lookupOrder, type OrderLookupResult } from "@/app/(store)/pedido/actions";
import { ReviewDialog } from "@/components/pedido/review-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/ui/star-rating";
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
  pronto_para_retirar: "Pronto para retirar na loja",
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

  function handleReviewSubmitted(orderItemId: string, review: NonNullable<OrderLookupResult["order"]>["items"][number]["review"]) {
    setResult((current) => {
      if (!current?.order) return current;
      return {
        order: {
          ...current.order,
          items: current.order.items.map((item) =>
            item.orderItemId === orderItemId ? { ...item, review } : item
          ),
        },
      };
    });
  }

  const order = result?.order;
  const pendingReviewCount =
    order?.items.filter((item) => item.productId && !item.review).length ?? 0;

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

          {order.canReview && pendingReviewCount > 0 && (
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm">
              <p className="font-medium">Pedido entregue! 🎉</p>
              <p className="text-muted-foreground">
                Esperamos que você tenha gostado da sua compra. Conte pra gente como foi sua
                experiência avaliando os produtos abaixo.
              </p>
            </div>
          )}

          <ul className="space-y-3 border-t border-border pt-3 text-sm">
            {order.items.map((item) => (
              <li key={item.orderItemId} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex justify-between gap-2 sm:block">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.productName}
                    {item.variationValue ? ` (${item.variationValue})` : ""}
                  </span>
                  <span className="sm:hidden">{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline">{formatPrice(item.unitPrice * item.quantity)}</span>
                  {order.canReview && item.productId && (
                    <>
                      {item.review ? (
                        item.review.status === "pendente" ? (
                          <Badge variant="secondary">Avaliação em análise</Badge>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <StarRating value={item.review.rating} size="sm" />
                            <Badge variant="success">Avaliado</Badge>
                          </div>
                        )
                      ) : (
                        <ReviewDialog
                          orderNumber={order.orderNumber}
                          email={email}
                          orderItemId={item.orderItemId}
                          productName={item.productName}
                          productImage={item.productImage}
                          onSubmitted={(review) => handleReviewSubmitted(item.orderItemId, review)}
                        />
                      )}
                    </>
                  )}
                </div>
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
