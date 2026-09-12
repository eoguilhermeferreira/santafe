"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { DeliveryStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { OrderWithItems } from "@/types/database.types";

export function RecentOrders({ orders }: { orders: OrderWithItems[] }) {
  const router = useRouter();

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
            <TableRow
              key={order.id}
              className="cursor-pointer"
              onClick={() => router.push(`/admin/pedidos/${order.id}`)}
            >
              <TableCell className="p-0">
                <Link
                  href={`/admin/pedidos/${order.id}`}
                  className="block px-3 py-3 font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
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
                <div className="flex flex-wrap items-center gap-1.5">
                  <DeliveryStatusBadge status={order.delivery_status} />
                  {order.delivery_method === "retirada" && (
                    <Badge variant="secondary">Retirada</Badge>
                  )}
                </div>
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
