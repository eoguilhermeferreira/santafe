import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getPaymentClient, mapMercadoPagoStatus } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Webhook do Mercado Pago. Nunca confia no conteúdo da notificação: usa o
 * id recebido só para buscar o pagamento real na API antes de atualizar
 * qualquer status — cobre os casos assíncronos (boleto pago dias depois,
 * Pix aprovado após o timeout do polling do checkout etc.).
 */
export async function POST(request: NextRequest) {
  let paymentId = request.nextUrl.searchParams.get("data.id") ?? request.nextUrl.searchParams.get("id");

  if (!paymentId) {
    try {
      const body = await request.json();
      paymentId = body?.data?.id ? String(body.data.id) : null;
    } catch {
      // corpo vazio ou não-JSON — segue só com os query params, se houver
    }
  }

  if (!paymentId) {
    return NextResponse.json({ received: true });
  }

  try {
    const payment = await getPaymentClient().get({ id: paymentId });
    const orderId = payment.external_reference;
    if (!orderId) return NextResponse.json({ received: true });

    const status = mapMercadoPagoStatus(payment.status ?? "pending");
    const supabase = createAdminClient();

    await supabase
      .from("orders")
      .update({
        payment_status: status,
        mercadopago_payment_id: payment.id ? String(payment.id) : undefined,
      })
      .eq("id", orderId);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook do Mercado Pago", error);
    // Responde 200 mesmo em erro para o MP não ficar reenviando indefinidamente
    // o mesmo evento; o erro já foi registrado no log do servidor.
    return NextResponse.json({ received: true });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
