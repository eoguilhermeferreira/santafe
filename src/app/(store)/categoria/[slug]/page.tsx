import Link from "next/link";
import { notFound } from "next/navigation";

import { BackButton } from "@/components/store/back-button";
import { ProductCard } from "@/components/store/product-card";
import { cn } from "@/lib/utils";
import { getCategoryBySlug, getProducts, getSubcategories } from "@/lib/queries";

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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string }>;
}) {
  const { slug } = await params;
  const { sub } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const subcategories = await getSubcategories(category.id);
  // Só aceita "sub" se for mesmo uma subcategoria dessa categoria — senão
  // cai em "Todos" em vez de confiar cegamente no que veio na URL.
  const activeSubcategory = subcategories.find((s) => s.slug === sub);
  const effectiveSlug = activeSubcategory?.slug ?? slug;

  const { products, total } = await getProducts({ categorySlug: effectiveSlug, pageSize: 48 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <BackButton />
      <div className="mb-6 mt-2 flex flex-col gap-3">
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">{category.name}</h1>
        <p className="text-sm text-muted-foreground">{total} produtos</p>
      </div>

      {subcategories.length > 0 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <Link
            href={`/categoria/${slug}`}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              !activeSubcategory
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input hover:bg-secondary"
            )}
          >
            Todos
          </Link>
          {subcategories.map((subcategory) => (
            <Link
              key={subcategory.id}
              href={`/categoria/${slug}?sub=${subcategory.slug}`}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                activeSubcategory?.id === subcategory.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input hover:bg-secondary"
              )}
            >
              {subcategory.name}
            </Link>
          ))}
        </div>
      )}

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
