import { notFound } from "next/navigation";

import { getOrder } from "@/app/admin/(protected)/pedidos/actions";
import { OrderDetail } from "@/app/admin/(protected)/pedidos/[id]/order-detail";

export const metadata = { title: "Detalhe do pedido" };

export default async function AdminPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return <OrderDetail order={order} />;
}
