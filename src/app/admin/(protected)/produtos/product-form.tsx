"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import type { ProductActionResult, ProductFormInput } from "@/app/admin/(protected)/produtos/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { HOME_SECTION_LABELS } from "@/lib/product-constants";
import { createClient } from "@/lib/supabase/client";
import type { Category, HomeSection, ProductWithRelations } from "@/types/database.types";

type Variation = { label: string; value: string; stock: number };
type HomeSectionOption = HomeSection | "__none__";

export function ProductForm({
  categories,
  product,
  onSave,
}: {
  categories: Category[];
  product?: ProductWithRelations;
  onSave: (input: ProductFormInput) => Promise<ProductActionResult>;
}) {
  const router = useRouter();
  const [name, setName] = React.useState(product?.name ?? "");
  const [brand, setBrand] = React.useState(product?.brand ?? "");
  const [description, setDescription] = React.useState(product?.description ?? "");
  const [categoryId, setCategoryId] = React.useState(product?.category_id ?? "__none__");
  const [price, setPrice] = React.useState(product?.price?.toString() ?? "");
  const [promoPrice, setPromoPrice] = React.useState(product?.promo_price?.toString() ?? "");
  const [stock, setStock] = React.useState(product?.stock?.toString() ?? "0");
  const [weight, setWeight] = React.useState(product?.weight_grams?.toString() ?? "200");
  const [isActive, setIsActive] = React.useState(product?.is_active ?? true);
  const [homeSection, setHomeSection] = React.useState<HomeSectionOption>(
    product?.home_section ?? "__none__"
  );
  const [images, setImages] = React.useState<string[]>(
    product?.product_images.map((i) => i.url) ?? []
  );
  const [variations, setVariations] = React.useState<Variation[]>(
    product?.product_variations.map((v) => ({ label: v.label, value: v.value, stock: v.stock })) ?? []
  );
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleAddImages(files: FileList) {
    setIsUploading(true);
    try {
      const supabase = createClient();
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("products").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("products").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setImages((current) => [...current, ...uploaded]);
    } catch (error) {
      console.error(error);
      toast.error("Falha ao enviar imagem");
    } finally {
      setIsUploading(false);
    }
  }

  function addVariationRow() {
    setVariations((current) => [...current, { label: "Tamanho", value: "", stock: 0 }]);
  }

  function updateVariation(index: number, patch: Partial<Variation>) {
    setVariations((current) =>
      current.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim() || !price) {
      toast.error("Preencha nome e preço");
      return;
    }

    setIsSaving(true);
    const result = await onSave({
      name: name.trim(),
      brand: brand.trim() || null,
      description: description.trim() || null,
      category_id: categoryId === "__none__" ? null : categoryId,
      price: Number(price),
      promo_price: promoPrice ? Number(promoPrice) : null,
      stock: Number(stock),
      weight_grams: Number(weight),
      is_active: isActive,
      home_section: homeSection === "__none__" ? null : homeSection,
      images: images.map((url) => ({ url })),
      variations: variations
        .filter((v) => v.value.trim())
        .map((v) => ({ label: v.label.trim() || "Opção", value: v.value.trim(), stock: v.stock })),
    });
    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Produto salvo");
    router.push("/admin/produtos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold">Informações do produto</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="mb-1.5 block">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label className="mb-1.5 block">Marca</Label>
            <Input value={brand ?? ""} onChange={(e) => setBrand(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Categoria</Label>
            <Select value={categoryId ?? "__none__"} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sem categoria</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.parent_id ? `— ${category.name}` : category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5 block">Descrição</Label>
            <Textarea rows={4} value={description ?? ""} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold">Preço e estoque</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <Label className="mb-1.5 block">Preço (R$)</Label>
            <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div>
            <Label className="mb-1.5 block">Preço promocional</Label>
            <Input type="number" min="0" step="0.01" value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Estoque (sem variação)</Label>
            <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Peso (gramas)</Label>
            <Input type="number" min="1" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label>Ativo</Label>
          </div>
          <div className="flex items-center gap-2">
            <Label>Seção da home</Label>
            <Select value={homeSection ?? "__none__"} onValueChange={(v) => setHomeSection(v as typeof homeSection)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhuma</SelectItem>
                {Object.entries(HOME_SECTION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold">Imagens</h2>
        <p className="text-sm text-muted-foreground">
          Adicione quantas fotos quiser — a primeira é a capa do produto.
        </p>
        <div className="flex flex-wrap gap-3">
          {images.map((url, index) => (
            <div key={url} className="relative size-24 overflow-hidden rounded-md border border-border">
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex size-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-xs text-muted-foreground hover:bg-secondary"
          >
            {isUploading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
            Adicionar
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleAddImages(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Variações (opcional)</h2>
          <Button type="button" variant="outline" size="sm" onClick={addVariationRow}>
            <Plus className="size-4" /> Adicionar
          </Button>
        </div>
        {variations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Use variações para tamanhos, cores etc. Deixe vazio se o produto não tiver variação.
          </p>
        ) : (
          <div className="space-y-2">
            {variations.map((variation, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_100px_40px] gap-2">
                <Input
                  placeholder="Rótulo (ex: Cor)"
                  value={variation.label}
                  onChange={(e) => updateVariation(index, { label: e.target.value })}
                />
                <Input
                  placeholder="Valor (ex: Marrom)"
                  value={variation.value}
                  onChange={(e) => updateVariation(index, { value: e.target.value })}
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Estoque"
                  value={variation.stock}
                  onChange={(e) => updateVariation(index, { stock: Number(e.target.value) })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setVariations((current) => current.filter((_, i) => i !== index))}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Button type="submit" size="lg" disabled={isSaving}>
        {isSaving && <Loader2 className="size-4 animate-spin" />}
        Salvar produto
      </Button>
    </form>
  );
}
