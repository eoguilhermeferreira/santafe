import { CategoryManager } from "@/app/admin/(protected)/categorias/category-manager";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Categorias" };

export default async function AdminCategoriasPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  return <CategoryManager categories={categories ?? []} />;
}
