import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { DeliveryStatus, PaymentStatus } from "@/types/database.types";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const PAYMENT_LABELS: Record<PaymentStatus, { label: string; variant: BadgeVariant }> = {
  pendente: { label: "Pendente", variant: "warning" },
  pago: { label: "Pago", variant: "success" },
  falhou: { label: "Falhou", variant: "destructive" },
  reembolsado: { label: "Reembolsado", variant: "secondary" },
};

const DELIVERY_LABELS: Record<DeliveryStatus, { label: string; variant: BadgeVariant }> = {
  recebido: { label: "Recebido", variant: "outline" },
  preparando: { label: "Preparando", variant: "warning" },
  enviado: { label: "Enviado", variant: "default" },
  entregue: { label: "Entregue", variant: "success" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, variant } = PAYMENT_LABELS[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const { label, variant } = DELIVERY_LABELS[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export { PAYMENT_LABELS, DELIVERY_LABELS };
