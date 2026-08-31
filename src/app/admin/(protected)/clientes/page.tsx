import { CustomerManager } from "@/app/admin/(protected)/clientes/customer-manager";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Clientes" };

export default async function AdminClientesPage() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  return <CustomerManager customers={customers ?? []} />;
}
