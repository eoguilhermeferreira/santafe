import Link from "next/link";

import { getCategoryIcon } from "@/lib/category-icons";
import type { Category } from "@/types/database.types";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const topLevel = categories.filter((c) => !c.parent_id);
  if (topLevel.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold sm:text-2xl">Categorias</h2>
      <div className="flex gap-5 overflow-x-auto pb-1 sm:gap-6">
        {topLevel.map((category) => {
          const Icon = getCategoryIcon(category.icon);
          return (
            <Link
              key={category.id}
              href={`/categoria/${category.slug}`}
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              <span className="flex size-16 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors group-hover:bg-accent/20 sm:size-20">
                <Icon className="size-7 sm:size-8" />
              </span>
              <span className="w-16 text-center text-xs font-medium text-foreground sm:w-20">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
