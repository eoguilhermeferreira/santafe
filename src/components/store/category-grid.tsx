import Link from "next/link";

import { getCategoryIcon } from "@/lib/category-icons";
import type { Category } from "@/types/database.types";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const topLevel = categories.filter((c) => !c.parent_id);
  if (topLevel.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {topLevel.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        return (
          <Link
            key={category.id}
            href={`/categoria/${category.slug}`}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-accent hover:bg-secondary/60"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Icon className="size-5" />
            </span>
            <span className="text-xs font-medium text-foreground">{category.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
