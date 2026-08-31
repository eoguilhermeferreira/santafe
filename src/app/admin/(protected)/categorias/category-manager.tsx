"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createCategory, deleteCategory, updateCategory } from "@/app/admin/(protected)/categorias/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/admin/image-upload";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import type { Category } from "@/types/database.types";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [open, setOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function openCreate() {
    setEditing(null);
    setImageUrl(null);
    setOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setImageUrl(category.image_url);
    setOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    const action = editing ? updateCategory.bind(null, editing.id) : createCategory;
    const result = await action(formData);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editing ? "Categoria atualizada" : "Categoria criada");
    setOpen(false);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result?.error) toast.error(result.error);
      else toast.success("Categoria removida");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Categorias</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus /> Nova categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar categoria" : "Nova categoria"}</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div>
                <Label className="mb-1.5 block">Nome</Label>
                <Input name="name" defaultValue={editing?.name} required />
              </div>
              <div>
                <Label className="mb-1.5 block">Categoria pai (opcional)</Label>
                <Select name="parent_id" defaultValue={editing?.parent_id ?? "__none__"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma (categoria de topo)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhuma (categoria de topo)</SelectItem>
                    {categories
                      .filter((c) => c.id !== editing?.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Ícone</Label>
                <Select name="icon" defaultValue={editing?.icon ?? "__none__"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ícone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Padrão</SelectItem>
                    {Object.keys(CATEGORY_ICONS).map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Imagem (opcional)</Label>
                <ImageUpload bucket="categories" value={imageUrl} onChange={setImageUrl} name="image_url" />
              </div>
              <div>
                <Label className="mb-1.5 block">Ordem de exibição</Label>
                <Input
                  name="display_order"
                  type="number"
                  defaultValue={editing?.display_order ?? 0}
                />
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
              <TableHead>Categoria pai</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {categories.find((c) => c.id === category.parent_id)?.name ?? "—"}
                </TableCell>
                <TableCell>{category.display_order}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(category)}>
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
                          <AlertDialogTitle>Remover categoria?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Produtos dessa categoria ficarão sem categoria. Essa ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction disabled={isPending} onClick={() => handleDelete(category.id)}>
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
