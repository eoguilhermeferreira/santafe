"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteProduct, toggleProductActive } from "@/app/admin/(protected)/produtos/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/format";
import type { ProductWithRelations } from "@/types/database.types";

export function ProductList({ products }: { products: ProductWithRelations[] }) {
  const [, startTransition] = React.useTransition();

  function handleToggle(id: string, next: boolean) {
    startTransition(async () => {
      const result = await toggleProductActive(id, next);
      if (result?.error) toast.error(result.error);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (result?.error) toast.error(result.error);
      else toast.success("Produto removido");
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Produto</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                  {product.product_images[0] && (
                    <Image src={product.product_images[0].url} alt="" fill className="object-cover" />
                  )}
                </div>
              </TableCell>
              <TableCell className="max-w-56 truncate font-medium">{product.name}</TableCell>
              <TableCell className="text-muted-foreground">{product.code}</TableCell>
              <TableCell className="text-muted-foreground">{product.categories?.name ?? "—"}</TableCell>
              <TableCell>{formatPrice(product.promo_price ?? product.price)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <Switch
                  checked={product.is_active}
                  onCheckedChange={(checked) => handleToggle(product.id, checked)}
                />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button asChild size="icon" variant="ghost">
                    <Link href={`/admin/produtos/${product.id}`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover produto?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(product.id)}>
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
