"use server";

import { randomUUID } from "node:crypto";

import { checkoutSchema, checkoutItemSchema } from "@/lib/checkout-schema";
import { getPaymentClient, mapMercadoPagoStatus } from "@/lib/mercadopago";
import { calculateShipping } from "@/lib/shipping";
import { createAdminClient } from "@/lib/supabase/admin";
import { onlyDigits } from "@/lib/format";
import { storeConfig } from "@/config/store";
import { z } from "zod";
import type { PaymentStatus } from "@/types/database.types";

const createOrderInput = z.object({
  customer: checkoutSchema,
  items: z.array(checkoutItemSchema).min(1, "Carrinho vazio"),
});

export interface CreateOrderResult {
  orderId?: string;
  orderNumber?: number;
  total?: number;
  error?: string;
}

/**
 * Cadastra (ou atualiza, se já existir pelo e-mail) o cliente a partir dos
 * dados do checkout. Além do cadastro manual em /admin/clientes, toda
 * compra gera/atualiza automaticamente o cliente correspondente. Nunca
 * bloqueia a criação do pedido — se falhar, o pedido segue sem customer_id.
 */
async function upsertCustomerFromCheckout(
  supabase: ReturnType<typeof createAdminClient>,
  customer: z.infer<typeof checkoutSchema>
): Promise<string | null> {
  try {
    const customerData = {
      name: customer.customerName,
      email: customer.email,
      phone: onlyDigits(customer.phone),
      cep: onlyDigits(customer.cep),
      street: customer.street,
      address_number: customer.number,
      complement: customer.complement || null,
      neighborhood: customer.neighborhood,
      city: customer.city,
      state: customer.state.toUpperCase(),
    };

    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("email", customer.email)
      .maybeSingle();

    if (existing) {
      await supabase.from("customers").update(customerData).eq("id", existing.id);
      return existing.id;
    }

    const { data: created, error } = await supabase
      .from("customers")
      .insert(customerData)
      .select("id")
      .single();

    if (error || !created) return null;
    return created.id;
  } catch (error) {
    console.error("Erro ao cadastrar cliente automaticamente", error);
    return null;
  }
}

/**
 * Cria o pedido no banco. Os preços são sempre buscados no servidor a
 * partir dos produtos — nunca confiamos no valor calculado no carrinho do
 * navegador.
 */
export async function createOrder(input: unknown): Promise<CreateOrderResult> {
  const parsed = createOrderInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const { customer, items } = parsed.data;

  const supabase = createAdminClient();

  const productIds = [...new Set(items.map((item) => item.productId))];
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*, product_variations(*)")
    .in("id", productIds);

  if (productsError) return { error: "Não foi possível carregar os produtos." };

  const orderItems: {
    product_id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    variation_label: string | null;
    variation_value: string | null;
  }[] = [];

  let subtotal = 0;

  for (const item of items) {
    const product = products?.find((p) => p.id === item.productId);
    if (!product || !product.is_active) {
      return { error: `Produto indisponível no pedido.` };
    }

    let stock = product.stock;
    let variationLabel: string | null = null;

    if (item.variationValue) {
      const variation = product.product_variations.find(
        (v) => v.value === item.variationValue
      );
      if (!variation) return { error: `Variação indisponível para ${product.name}.` };
      stock = variation.stock;
      variationLabel = variation.label;
    }

    if (item.quantity > stock) {
      return { error: `Estoque insuficiente para ${product.name}.` };
    }

    const unitPrice = product.promo_price ?? product.price;
    subtotal += unitPrice * item.quantity;

    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      unit_price: unitPrice,
      quantity: item.quantity,
      variation_label: variationLabel,
      variation_value: item.variationValue ?? null,
    });
  }

  const shipping = calculateShipping();
  const total = subtotal + shipping.cost;
  const customerId = await upsertCustomerFromCheckout(supabase, customer);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: customer.customerName,
      email: customer.email,
      phone: onlyDigits(customer.phone),
      customer_id: customerId,
      shipping_address: {
        cep: onlyDigits(customer.cep),
        street: customer.street,
        number: customer.number,
        complement: customer.complement,
        neighborhood: customer.neighborhood,
        city: customer.city,
        state: customer.state.toUpperCase(),
      },
      subtotal,
      shipping_cost: shipping.cost,
      total,
      shipping_method: shipping.label,
      payment_method: customer.paymentMethod,
      payment_status: "pendente",
      delivery_status: "recebido",
    })
    .select("id, order_number, total")
    .single();

  if (orderError || !order) {
    return { error: "Não foi possível criar o pedido. Tente novamente." };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) {
    return { error: "Não foi possível salvar os itens do pedido." };
  }

  return { orderId: order.id, orderNumber: order.order_number, total: order.total };
}

export interface SubmitPaymentResult {
  status?: PaymentStatus;
  orderNumber?: number;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  boletoUrl?: string;
  error?: string;
}

/**
 * Recebe os dados devolvidos pelo Payment Brick, recalcula o valor a
 * partir do pedido já salvo (nunca do valor enviado pelo formulário) e
 * cria o pagamento no Mercado Pago com chave de idempotência.
 */
export async function submitPayment(
  orderId: string,
  brickFormData: Record<string, unknown>
): Promise<SubmitPaymentResult> {
  if (!orderId) return { error: "Pedido inválido." };

  const supabase = createAdminClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) return { error: "Pedido não encontrado." };

  try {
    const payment = getPaymentClient();
    const response = await payment.create({
      body: {
        ...brickFormData,
        transaction_amount: order.total,
        description: `Pedido ${storeConfig.name} #${order.order_number}`,
        external_reference: order.id,
        payer: {
          ...(brickFormData.payer as Record<string, unknown> | undefined),
          email: order.email,
        },
        notification_url: `${storeConfig.siteUrl}/api/webhooks/mercadopago`,
      },
      requestOptions: { idempotencyKey: randomUUID() },
    });

    const status = mapMercadoPagoStatus(response.status ?? "pending");

    await supabase
      .from("orders")
      .update({
        payment_status: status,
        mercadopago_payment_id: response.id ? String(response.id) : null,
      })
      .eq("id", orderId);

    const pixData = response.point_of_interaction?.transaction_data;

    return {
      status,
      orderNumber: order.order_number,
      pixQrCode: pixData?.qr_code ?? undefined,
      pixQrCodeBase64: pixData?.qr_code_base64 ?? undefined,
      boletoUrl: response.transaction_details?.external_resource_url ?? undefined,
    };
  } catch (error) {
    console.error("Erro ao criar pagamento no Mercado Pago", error);
    return { error: "Não foi possível processar o pagamento. Tente novamente." };
  }
}

export async function getOrderStatus(
  orderId: string
): Promise<{ paymentStatus: PaymentStatus; orderNumber: number } | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("payment_status, order_number")
    .eq("id", orderId)
    .maybeSingle();

  if (!data) return null;
  return { paymentStatus: data.payment_status, orderNumber: data.order_number };
}
