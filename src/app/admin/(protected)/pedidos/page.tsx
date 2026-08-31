import { getOrders } from "@/app/admin/(protected)/pedidos/actions";
import { OrderList } from "@/app/admin/(protected)/pedidos/order-list";

export const metadata = { title: "Pedidos" };

export default async function AdminPedidosPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold">Pedidos</h1>
      <OrderList initialOrders={orders} />
    </div>
  );
}
