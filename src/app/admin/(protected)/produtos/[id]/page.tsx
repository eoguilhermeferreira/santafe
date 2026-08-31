import { notFound } from "next/navigation";

import { updateProduct } from "@/app/admin/(protected)/produtos/actions";
import { ProductForm } from "@/app/admin/(protected)/produtos/product-form";
import { createClient } from "@/lib/supabase/server";
import type { ProductWithRelations } from "@/types/database.types";

export const metadata = { title: "Editar produto" };

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_images(*), product_variations(*), categories:category_id(id, name, slug)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("*").order("display_order", { ascending: true }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold">Editar produto</h1>
      <ProductForm
        categories={categories ?? []}
        product={product as unknown as ProductWithRelations}
        onSave={updateProduct.bind(null, id)}
      />
    </div>
  );
}
