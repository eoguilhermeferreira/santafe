import Link from "next/link";

import { DeliveryStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { OrderWithItems } from "@/types/database.types";

export function RecentOrders({ orders }: { orders: OrderWithItems[] }) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Pedidos recentes</h2>
        <Link href="/admin/pedidos" className="text-sm text-accent hover:underline">
          Ver todos
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Entrega</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="cursor-pointer">
              <TableCell className="p-0">
                <Link href={`/admin/pedidos/${order.id}`} className="block px-3 py-3 font-medium">
                  #{order.order_number}
                </Link>
              </TableCell>
              <TableCell>{order.customer_name}</TableCell>
              <TableCell className="text-muted-foreground">{formatDateTime(order.created_at)}</TableCell>
              <TableCell>{formatPrice(order.total)}</TableCell>
              <TableCell>
                <PaymentStatusBadge status={order.payment_status} />
              </TableCell>
              <TableCell>
                <DeliveryStatusBadge status={order.delivery_status} />
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                Nenhum pedido ainda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
