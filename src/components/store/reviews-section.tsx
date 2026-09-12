"use client";

import * as React from "react";

import { ReviewCard } from "@/components/store/review-card";
import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils";
import type { Review } from "@/types/database.types";
import type { ProductReviewsData } from "@/lib/queries";

type Filter = "all" | 5 | 4 | 3 | 2 | 1 | "photos" | "videos";

function matchesFilter(review: Review, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "photos") return review.photo_urls.length > 0;
  if (filter === "videos") return Boolean(review.video_url);
  return review.rating === filter;
}

export function ReviewsSection({ data }: { data: ProductReviewsData }) {
  const [filter, setFilter] = React.useState<Filter>("all");
  const filtered = React.useMemo(
    () => data.reviews.filter((review) => matchesFilter(review, filter)),
    [data.reviews, filter]
  );

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "Todas" },
    { value: 5, label: "5 estrelas" },
    { value: 4, label: "4 estrelas" },
    { value: 3, label: "3 estrelas" },
    { value: 2, label: "2 estrelas" },
    { value: 1, label: "1 estrela" },
    { value: "photos", label: "Com fotos" },
    { value: "videos", label: "Com vídeos" },
  ];

  return (
    <section className="mt-14 space-y-6 border-t border-border pt-10">
      <h2 className="font-display text-xl font-semibold">Avaliações dos clientes</h2>

      {data.total === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ainda não há avaliações pra esse produto. Depois que seu pedido for entregue, você
          pode ser o primeiro a avaliar!
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex items-center gap-3">
              <span className="font-display text-4xl font-semibold">{data.average.toFixed(1)}</span>
              <div>
                <StarRating value={data.average} size="md" />
                <p className="text-xs text-muted-foreground">Baseado em {data.total} avaliações</p>
              </div>
            </div>

            <div className="flex-1 space-y-1">
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const count = data.distribution[star];
                const percent = data.total > 0 ? (count / data.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-12 shrink-0">{star} estrelas</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="w-6 shrink-0 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  filter === option.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div>
            {filtered.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">Nenhuma avaliação com esse filtro.</p>
            ) : (
              filtered.map((review) => <ReviewCard key={review.id} review={review} />)
            )}
          </div>
        </>
      )}
    </section>
  );
}
