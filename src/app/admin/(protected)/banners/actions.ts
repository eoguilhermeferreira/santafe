"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const bannerSchema = z.object({
  title: z.string().trim().nullable(),
  description: z.string().trim().nullable(),
  image_url: z.string().trim().min(1, "Envie uma imagem"),
  button_label: z.string().trim().nullable(),
  button_link: z.string().trim().nullable(),
  is_active: z.boolean(),
  display_order: z.number().int().default(0),
});

function optional(value: FormDataEntryValue | null) {
  return value ? String(value) : null;
}

function parseFormData(formData: FormData) {
  return bannerSchema.parse({
    title: optional(formData.get("title")),
    description: optional(formData.get("description")),
    image_url: formData.get("image_url"),
    button_label: optional(formData.get("button_label")),
    button_link: optional(formData.get("button_link")),
    is_active: formData.get("is_active") === "on",
    display_order: Number(formData.get("display_order") ?? 0),
  });
}

export async function createBanner(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const parsed = parseFormData(formData);
  const { error } = await supabase.from("banners").insert(parsed);
  if (error) return { error: error.message };

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return {};
}

export async function updateBanner(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const parsed = parseFormData(formData);
  const { error } = await supabase.from("banners").update(parsed).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return {};
}

export async function deleteBanner(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return {};
}
