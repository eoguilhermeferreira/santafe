"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { slugify } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto"),
  parent_id: z.string().uuid().nullable(),
  icon: z.string().trim().nullable(),
  image_url: z.string().trim().nullable(),
  display_order: z.number().int().default(0),
});

function nullableField(value: FormDataEntryValue | null) {
  if (!value || value === "__none__") return null;
  return String(value);
}

function parseFormData(formData: FormData) {
  return categorySchema.parse({
    name: formData.get("name"),
    parent_id: nullableField(formData.get("parent_id")),
    icon: nullableField(formData.get("icon")),
    image_url: nullableField(formData.get("image_url")),
    display_order: Number(formData.get("display_order") ?? 0),
  });
}

export async function createCategory(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const values = parseFormData(formData);

  const { error } = await supabase.from("categories").insert({
    ...values,
    slug: slugify(values.name),
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return {};
}

export async function updateCategory(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const values = parseFormData(formData);

  const { error } = await supabase
    .from("categories")
    .update({ ...values, slug: slugify(values.name) })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return {};
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return {};
}
