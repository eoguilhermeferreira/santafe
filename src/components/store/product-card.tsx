import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { discountPercent, formatPrice } from "@/lib/format";
import type { ProductWithRelations } from "@/types/database.types";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const image = product.product_images[0];
  const discount = discountPercent(product.price, product.promo_price);
  const outOfStock =
    product.stock <= 0 && product.product_variations.every((v) => v.stock <= 0);

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image.url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
              !product.is_active ? "grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Sem imagem
          </div>
        )}

        {!product.is_active && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="-rotate-12 rounded bg-foreground px-3 py-1 text-xs font-semibold uppercase tracking-wide text-background">
              Indisponível
            </span>
          </div>
        )}

        {product.is_active && discount && (
          <Badge variant="accent" className="absolute left-2 top-2">
            -{discount}%
          </Badge>
        )}
        {product.is_active && !discount && outOfStock && (
          <Badge variant="secondary" className="absolute left-2 top-2">
            Esgotado
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</h3>
        <div className="mt-auto pt-1">
          {product.promo_price ? (
            <div className="flex items-baseline gap-2">
              <span className="font-display text-base font-semibold text-primary">
                {formatPrice(product.promo_price)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            <span className="font-display text-base font-semibold text-foreground">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
