"use client";

import Link from "next/link";
import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteOrder, getOrders } from "@/app/admin/(protected)/pedidos/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DeliveryStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { OrderWithItems } from "@/types/database.types";

const POLL_INTERVAL_MS = 8000;

export function OrderList({ initialOrders }: { initialOrders: OrderWithItems[] }) {
  const [orders, setOrders] = React.useState(initialOrders);
  const [, startTransition] = React.useTransition();

  React.useEffect(() => {
    const interval = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      const fresh = await getOrders();
      setOrders(fresh);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteOrder(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setOrders((current) => current.filter((order) => order.id !== id));
      toast.success("Pedido excluído");
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Entrega</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="cursor-pointer">
              <TableCell className="p-0">
                <Link
                  href={`/admin/pedidos/${order.id}`}
                  className="block px-3 py-3 font-medium"
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
                <DeliveryStatusBadge status={order.delivery_status} />
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Excluir pedido"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir pedido #{order.order_number}?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(order.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                Nenhum pedido ainda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
