"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { onlyDigits } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const customerSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto"),
  email: z.string().trim().nullable(),
  phone: z.string().trim().nullable(),
  cpf: z.string().trim().nullable(),
  cep: z.string().trim().nullable(),
  street: z.string().trim().nullable(),
  address_number: z.string().trim().nullable(),
  complement: z.string().trim().nullable(),
  neighborhood: z.string().trim().nullable(),
  city: z.string().trim().nullable(),
  state: z.string().trim().nullable(),
});

function optional(value: FormDataEntryValue | null) {
  return value ? String(value) : null;
}

function parseFormData(formData: FormData) {
  return customerSchema.parse({
    name: formData.get("name"),
    email: optional(formData.get("email")),
    phone: optional(formData.get("phone")) ? onlyDigits(String(formData.get("phone"))) : null,
    cpf: optional(formData.get("cpf")) ? onlyDigits(String(formData.get("cpf"))) : null,
    cep: optional(formData.get("cep")) ? onlyDigits(String(formData.get("cep"))) : null,
    street: optional(formData.get("street")),
    address_number: optional(formData.get("address_number")),
    complement: optional(formData.get("complement")),
    neighborhood: optional(formData.get("neighborhood")),
    city: optional(formData.get("city")),
    state: optional(formData.get("state")),
  });
}

export async function createCustomer(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").insert(parseFormData(formData));
  if (error) return { error: error.message };

  revalidatePath("/admin/clientes");
  return {};
}

export async function updateCustomer(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").update(parseFormData(formData)).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/clientes");
  return {};
}

export async function deleteCustomer(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/clientes");
  return {};
}
