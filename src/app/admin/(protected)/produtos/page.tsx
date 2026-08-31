import Link from "next/link";
import { Plus } from "lucide-react";

import { ProductList } from "@/app/admin/(protected)/produtos/product-list";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { ProductWithRelations } from "@/types/database.types";

export const metadata = { title: "Produtos" };

export default async function AdminProdutosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), product_variations(*), categories:category_id(id, name, slug)")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as unknown as ProductWithRelations[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Produtos</h1>
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus /> Novo produto
          </Link>
        </Button>
      </div>
      <ProductList products={products} />
    </div>
  );
}
