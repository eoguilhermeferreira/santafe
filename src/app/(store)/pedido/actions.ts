"use server";

import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import type { DeliveryStatus, PaymentStatus } from "@/types/database.types";

const lookupInput = z.object({
  orderNumber: z.coerce.number().int().positive(),
  email: z.string().trim().email(),
});

export interface OrderLookupResult {
  error?: string;
  order?: {
    id: string;
    orderNumber: number;
    subtotal: number;
    shippingCost: number;
    shippingMethod: string | null;
    total: number;
    paymentStatus: PaymentStatus;
    deliveryStatus: DeliveryStatus;
    createdAt: string;
    items: {
      productName: string;
      quantity: number;
      unitPrice: number;
      variationValue: string | null;
    }[];
  };
}

/**
 * Consulta pública de pedido sem login: número do pedido + e-mail usado na
 * compra. Não expõe endereço/telefone — só o essencial pra acompanhar o
 * status e, se estiver pendente, pagar de novo sem criar outro pedido.
 */
export async function lookupOrder(input: unknown): Promise<OrderLookupResult> {
  const parsed = lookupInput.safeParse(input);
  if (!parsed.success) {
    return { error: "Informe o número do pedido e o e-mail usado na compra." };
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", parsed.data.orderNumber)
    .maybeSingle();

  if (!order || order.email.toLowerCase() !== parsed.data.email.toLowerCase()) {
    return { error: "Pedido não encontrado. Confira o número e o e-mail informados." };
  }

  return {
    order: {
      id: order.id,
      orderNumber: order.order_number,
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost,
      shippingMethod: order.shipping_method,
      total: order.total,
      paymentStatus: order.payment_status,
      deliveryStatus: order.delivery_status,
      createdAt: order.created_at,
      items: order.order_items.map((item) => ({
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        variationValue: item.variation_value,
      })),
    },
  };
}
