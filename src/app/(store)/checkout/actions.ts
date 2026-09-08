"use server";

import { checkoutSchema, checkoutItemSchema } from "@/lib/checkout-schema";
import { getMelhorEnvioOptions, type ShippingOption } from "@/lib/melhor-envio";
import { getPreferenceClient } from "@/lib/mercadopago";
import { calculateShipping } from "@/lib/shipping";
import { createAdminClient } from "@/lib/supabase/admin";
import { onlyDigits } from "@/lib/format";
import { storeConfig } from "@/config/store";
import { z } from "zod";

/**
 * Opções de frete pra exibir no checkout (o cliente escolhe uma) assim que
 * preenche o CEP. Tenta o Melhor Envio (preço real por CEP/peso, só
 * Correios/Jadlog/Loggi, até 2 serviços de cada); sem token configurado ou
 * se a cotação falhar/vier vazia, cai pro frete fixo como única opção.
 */
export async function getShippingOptions(
  cep: string,
  weightGrams: number
): Promise<ShippingOption[]> {
  const options = await getMelhorEnvioOptions({ toCep: cep, weightGrams });
  if (options.length > 0) return options;
  const flat = calculateShipping();
  return [{ id: "flat", label: flat.label, cost: flat.cost }];
}

const createOrderInput = z.object({
  customer: checkoutSchema,
  items: z.array(checkoutItemSchema).min(1, "Carrinho vazio"),
  shippingOptionId: z.string().optional(),
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
  const { customer, items, shippingOptionId } = parsed.data;

  const supabase = createAdminClient();

  const productIds = [...new Set(items.map((item) => item.productId))];
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*, product_variations(*)")
    .in("id", productIds);

  if (productsError) {
    console.error("Erro ao carregar produtos no checkout", productsError);
    return { error: "Não foi possível carregar os produtos." };
  }

  const orderItems: {
    product_id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    variation_label: string | null;
    variation_value: string | null;
  }[] = [];

  let subtotal = 0;
  let totalWeightGrams = 0;

  for (const item of items) {
    const product = products?.find((p) => p.id === item.productId);
    if (!product || !product.is_active) {
      return { error: `Produto indisponível no pedido.` };
    }
    totalWeightGrams += product.weight_grams * item.quantity;

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

  const shippingOptions = await getShippingOptions(customer.cep, totalWeightGrams);
  const shipping =
    shippingOptions.find((option) => option.id === shippingOptionId) ?? shippingOptions[0];
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

export interface CreatePreferenceResult {
  initPoint?: string;
  error?: string;
}

/**
 * Checkout Pro: gera a preferência de pagamento pro pedido já criado e
 * devolve o `init_point` — a URL da página de pagamento hospedada pelo
 * Mercado Pago pra onde o cliente é redirecionado (Pix, cartão de
 * crédito/débito de qualquer banco e boleto aparecem todos lá).
 */
export async function createCheckoutPreference(orderId: string): Promise<CreatePreferenceResult> {
  if (!orderId) return { error: "Pedido inválido." };

  const supabase = createAdminClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) return { error: "Pedido não encontrado." };
  if (order.payment_status === "pago") return { error: "Este pedido já foi pago." };

  const items = order.order_items.map((item) => ({
    id: item.id,
    title: item.variation_value ? `${item.product_name} (${item.variation_value})` : item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    currency_id: "BRL",
  }));

  if (order.shipping_cost > 0) {
    items.push({
      id: "frete",
      title: order.shipping_method || "Frete",
      quantity: 1,
      unit_price: order.shipping_cost,
      currency_id: "BRL",
    });
  }

  const isProduction = storeConfig.siteUrl.startsWith("https://");

  try {
    const preference = getPreferenceClient();
    const response = await preference.create({
      body: {
        items,
        external_reference: order.id,
        payer: { name: order.customer_name, email: order.email },
        back_urls: {
          success: `${storeConfig.siteUrl}/checkout/sucesso?pedido=${order.order_number}`,
          pending: `${storeConfig.siteUrl}/checkout/pendente?pedido=${order.order_number}`,
          failure: `${storeConfig.siteUrl}/checkout/erro?pedido=${order.order_number}`,
        },
        ...(isProduction ? { auto_return: "approved" as const } : {}),
        notification_url: `${storeConfig.siteUrl}/api/webhooks/mercadopago`,
        statement_descriptor: storeConfig.shortName,
      },
    });

    if (!response.init_point) {
      return { error: "Não foi possível iniciar o pagamento." };
    }

    return { initPoint: response.init_point };
  } catch (error) {
    console.error("Erro ao criar preferência no Mercado Pago", error);
    return { error: "Não foi possível iniciar o pagamento. Tente novamente." };
  }
}
