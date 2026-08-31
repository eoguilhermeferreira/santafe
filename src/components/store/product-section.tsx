import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/store/product-card";
import type { ProductWithRelations } from "@/types/database.types";

export function ProductSection({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: ProductWithRelations[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{title}</h2>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          Ver tudo <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
