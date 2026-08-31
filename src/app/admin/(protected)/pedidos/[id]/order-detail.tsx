"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateOrderStatus } from "@/app/admin/(protected)/pedidos/actions";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { PAYMENT_LABELS, DELIVERY_LABELS } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime, formatPrice, onlyDigits } from "@/lib/format";
import type { DeliveryStatus, OrderWithItems, PaymentStatus } from "@/types/database.types";

export function OrderDetail({ order }: { order: OrderWithItems }) {
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus>(order.payment_status);
  const [deliveryStatus, setDeliveryStatus] = React.useState<DeliveryStatus>(order.delivery_status);
  const [trackingCode, setTrackingCode] = React.useState(order.tracking_code ?? "");
  const [isSaving, setIsSaving] = React.useState(false);

  const address = order.shipping_address;

  async function handleSave() {
    setIsSaving(true);
    const result = await updateOrderStatus(order.id, {
      payment_status: paymentStatus,
      delivery_status: deliveryStatus,
      tracking_code: trackingCode || null,
    });
    setIsSaving(false);

    if (result.error) toast.error(result.error);
    else toast.success("Pedido atualizado");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Pedido #{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">{formatDateTime(order.created_at)}</p>
        </div>
        <Button asChild variant="outline">
          <a
            href={`https://wa.me/55${onlyDigits(order.phone)}`}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsAppIcon className="size-4" /> Falar com o cliente
          </a>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-3 p-6">
            <h2 className="font-display text-lg font-semibold">Itens</h2>
            <div className="divide-y divide-border">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    {item.variation_label && (
                      <p className="text-xs text-muted-foreground">
                        {item.variation_label}: {item.variation_value}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                  </div>
                  <span className="font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1 border-t border-border pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frete ({order.shipping_method})</span>
                <span>{formatPrice(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between font-display text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </Card>

          <Card className="space-y-2 p-6">
            <h2 className="font-display text-lg font-semibold">Cliente e entrega</h2>
            <p className="text-sm">{order.customer_name}</p>
            <p className="text-sm text-muted-foreground">{order.email} · {order.phone}</p>
            <p className="text-sm text-muted-foreground">
              {address.street}, {address.number}
              {address.complement ? ` - ${address.complement}` : ""} · {address.neighborhood}
              <br />
              {address.city} - {address.state} · CEP {address.cep}
            </p>
          </Card>
        </div>

        <Card className="h-fit space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold">Status</h2>
          <div>
            <Label className="mb-1.5 block">Pagamento ({order.payment_method})</Label>
            <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_LABELS).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">Entrega</Label>
            <Select value={deliveryStatus} onValueChange={(v) => setDeliveryStatus(v as DeliveryStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DELIVERY_LABELS).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">Código de rastreio</Label>
            <Input value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            Salvar alterações
          </Button>
        </Card>
      </div>
    </div>
  );
}
