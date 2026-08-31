"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createCustomer, deleteCustomer, updateCustomer } from "@/app/admin/(protected)/clientes/actions";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Customer } from "@/types/database.types";

export function CustomerManager({ customers }: { customers: Customer[] }) {
  const [editing, setEditing] = React.useState<Customer | null>(null);
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    const action = editing ? updateCustomer.bind(null, editing.id) : createCustomer;
    const result = await action(formData);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editing ? "Cliente atualizado" : "Cliente criado");
    setOpen(false);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteCustomer(id);
      if (result?.error) toast.error(result.error);
      else toast.success("Cliente removido");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Clientes</h1>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus /> Novo cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar cliente" : "Novo cliente"}</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block">Nome</Label>
                  <Input name="name" defaultValue={editing?.name} required />
                </div>
                <div>
                  <Label className="mb-1.5 block">E-mail</Label>
                  <Input name="email" type="email" defaultValue={editing?.email ?? ""} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Telefone</Label>
                  <Input name="phone" defaultValue={editing?.phone ?? ""} />
                </div>
                <div>
                  <Label className="mb-1.5 block">CPF</Label>
                  <Input name="cpf" defaultValue={editing?.cpf ?? ""} />
                </div>
                <div>
                  <Label className="mb-1.5 block">CEP</Label>
                  <Input name="cep" defaultValue={editing?.cep ?? ""} />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block">Rua</Label>
                  <Input name="street" defaultValue={editing?.street ?? ""} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Número</Label>
                  <Input name="address_number" defaultValue={editing?.address_number ?? ""} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Complemento</Label>
                  <Input name="complement" defaultValue={editing?.complement ?? ""} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Bairro</Label>
                  <Input name="neighborhood" defaultValue={editing?.neighborhood ?? ""} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Cidade</Label>
                  <Input name="city" defaultValue={editing?.city ?? ""} />
                </div>
                <div>
                  <Label className="mb-1.5 block">UF</Label>
                  <Input name="state" maxLength={2} defaultValue={editing?.state ?? ""} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editing ? "Salvar" : "Criar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {customer.email || customer.phone || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {customer.city ? `${customer.city} - ${customer.state}` : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditing(customer);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover cliente?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction disabled={isPending} onClick={() => handleDelete(customer.id)}>
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
    </div>
  );
}
