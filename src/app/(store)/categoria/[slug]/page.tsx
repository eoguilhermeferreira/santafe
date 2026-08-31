import { notFound } from "next/navigation";

import { ProductCard } from "@/components/store/product-card";
import { getCategoryBySlug, getProducts } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name ?? "Categoria" };
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { products, total } = await getProducts({ categorySlug: slug, pageSize: 48 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3">
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">{category.name}</h1>
        <p className="text-sm text-muted-foreground">{total} produtos</p>
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          Ainda não há produtos nessa categoria.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
