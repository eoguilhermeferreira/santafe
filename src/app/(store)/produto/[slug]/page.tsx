import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCart } from "@/components/store/add-to-cart";
import { BackButton } from "@/components/store/back-button";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { Badge } from "@/components/ui/badge";
import { discountPercent, formatPrice } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Produto" };
}

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category_id, product.id);
  const discount = discountPercent(product.price, product.promo_price);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <BackButton />
      <nav className="mb-6 mt-2 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-accent">Início</Link>
        <span>/</span>
        {product.categories && (
          <>
            <Link href={`/categoria/${product.categories.slug}`} className="hover:text-accent">
              {product.categories.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={product.product_images}
          alt={product.name}
          unavailable={!product.is_active}
        />

        <div className="flex flex-col gap-4">
          {product.brand && (
            <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {product.brand}
            </span>
          )}
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">{product.name}</h1>

          <div className="flex items-center gap-3">
            {product.promo_price ? (
              <>
                <span className="font-display text-3xl font-semibold text-primary">
                  {formatPrice(product.promo_price)}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                {discount && <Badge variant="accent">-{discount}%</Badge>}
              </>
            ) : (
              <span className="font-display text-3xl font-semibold">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <AddToCart product={product} />

          {product.description && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <h2 className="text-sm font-semibold">Descrição</h2>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14 space-y-4">
          <h2 className="font-display text-xl font-semibold">Você também pode gostar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
