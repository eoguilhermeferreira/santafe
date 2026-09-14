"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { slugify } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const productFormSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto"),
  description: z.string().trim().nullable(),
  category_id: z.string().uuid().nullable(),
  price: z.number().nonnegative(),
  promo_price: z.number().nonnegative().nullable(),
  stock: z.number().int().nonnegative(),
  weight_grams: z.number().int().positive(),
  is_active: z.boolean(),
  home_section: z.enum(["mais_vendidos", "novidades", "ofertas"]).nullable(),
  barcode: z.string().trim().nullable(),
  images: z.array(z.object({ url: z.string().min(1) })),
  variations: z.array(
    z.object({
      label: z.string().trim().min(1),
      value: z.string().trim().min(1),
      stock: z.number().int().nonnegative(),
    })
  ),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

export interface ProductActionResult {
  id?: string;
  error?: string;
}

/** Código 23505 do Postgres = violação de unicidade (aqui, sempre o barcode). */
function friendlyError(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "Esse código de barras já está cadastrado em outro produto.";
  return error.message;
}

export interface ProductByBarcode {
  id: string;
  name: string;
  slug: string;
}

/**
 * Reconhece um produto já cadastrado pelo código de barras lido no leitor —
 * usado na tela de novo produto pra abrir direto o produto existente em vez
 * de deixar cadastrar duplicado.
 */
export async function getProductByBarcode(barcode: string): Promise<ProductByBarcode | null> {
  const trimmed = barcode.trim();
  if (!trimmed) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug")
    .eq("barcode", trimmed)
    .maybeSingle();

  return data;
}

async function saveRelations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  images: { url: string }[],
  variations: { label: string; value: string; stock: number }[]
) {
  await supabase.from("product_images").delete().eq("product_id", productId);
  await supabase.from("product_variations").delete().eq("product_id", productId);

  if (images.length > 0) {
    const { error } = await supabase.from("product_images").insert(
      images.map((image, index) => ({
        product_id: productId,
        url: image.url,
        display_order: index,
      }))
    );
    if (error) throw error;
  }

  if (variations.length > 0) {
    const { error } = await supabase.from("product_variations").insert(
      variations.map((variation) => ({ ...variation, product_id: productId }))
    );
    if (error) throw error;
  }
}

export async function createProduct(input: ProductFormInput): Promise<ProductActionResult> {
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  const { images, variations, ...product } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({ ...product, slug: slugify(product.name) })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error ? friendlyError(error) : "Não foi possível criar o produto." };
  }

  try {
    await saveRelations(supabase, data.id, images, variations);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao salvar imagens/variações." };
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  revalidatePath("/");
  return { id: data.id };
}

export async function updateProduct(id: string, input: ProductFormInput): Promise<ProductActionResult> {
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  const { images, variations, ...product } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ ...product, slug: slugify(product.name) })
    .eq("id", id);

  if (error) return { error: friendlyError(error) };

  try {
    await saveRelations(supabase, id, images, variations);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao salvar imagens/variações." };
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  revalidatePath(`/produto/${product.name}`);
  revalidatePath("/");
  return { id };
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  return {};
}

export async function toggleProductActive(id: string, isActive: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  return {};
}

