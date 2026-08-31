import { createProduct } from "@/app/admin/(protected)/produtos/actions";
import { ProductForm } from "@/app/admin/(protected)/produtos/product-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Novo produto" };

export default async function NovoProdutoPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold">Novo produto</h1>
      <ProductForm categories={categories ?? []} onSave={createProduct} />
    </div>
  );
}
