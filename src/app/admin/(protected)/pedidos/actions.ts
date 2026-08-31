"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { DeliveryStatus, OrderWithItems, PaymentStatus } from "@/types/database.types";

export async function getOrders(): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (data ?? []) as unknown as OrderWithItems[];
}

export async function getOrder(id: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  return data as unknown as OrderWithItems | null;
}

const updateSchema = z.object({
  payment_status: z.enum(["pendente", "pago", "falhou", "reembolsado"]).optional(),
  delivery_status: z.enum(["recebido", "preparando", "enviado", "entregue", "cancelado"]).optional(),
  tracking_code: z.string().trim().nullable().optional(),
});

export async function updateOrderStatus(
  id: string,
  input: {
    payment_status?: PaymentStatus;
    delivery_status?: DeliveryStatus;
    tracking_code?: string | null;
  }
): Promise<{ error?: string }> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin");
  return {};
}

export async function deleteOrder(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  return {};
}
