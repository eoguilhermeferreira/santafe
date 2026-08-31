import Link from "next/link";

import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/queries";

const PAGE_SIZE = 24;

export const metadata = {
  title: "Produtos",
};

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; pagina?: string }>;
}) {
  const { busca, pagina } = await searchParams;
  const page = Math.max(1, Number(pagina) || 1);

  const { products, total } = await getProducts({
    search: busca,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3">
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">
          {busca ? `Resultados para "${busca}"` : "Todos os produtos"}
        </h1>
        <p className="text-sm text-muted-foreground">{total} produtos encontrados</p>
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          Nenhum produto encontrado. Tente outra busca.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button asChild variant="outline" size="sm" disabled={page <= 1}>
            <Link
              href={{
                pathname: "/produtos",
                query: { ...(busca ? { busca } : {}), pagina: String(page - 1) },
              }}
              aria-disabled={page <= 1}
            >
              Anterior
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
            <Link
              href={{
                pathname: "/produtos",
                query: { ...(busca ? { busca } : {}), pagina: String(page + 1) },
              }}
              aria-disabled={page >= totalPages}
            >
              Próxima
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
