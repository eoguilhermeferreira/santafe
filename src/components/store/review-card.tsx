import { BadgeCheck } from "lucide-react";

import { StarRating } from "@/components/ui/star-rating";
import { formatDate } from "@/lib/format";
import type { Review } from "@/types/database.types";

function displayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="space-y-2 border-b border-border py-4 last:border-0">
      <div className="flex items-center justify-between gap-2">
        <StarRating value={review.rating} size="sm" />
        <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{displayName(review.customer_name)}</span>
        {review.verified_purchase && (
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <BadgeCheck className="size-3.5" /> Compra verificada
          </span>
        )}
      </div>

      {review.comment && <p className="text-sm text-foreground/90">{review.comment}</p>}

      {(review.photo_urls.length > 0 || review.video_url) && (
        <div className="flex flex-wrap gap-2 pt-1">
          {review.photo_urls.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative size-16 overflow-hidden rounded-md border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- galeria simples de mídia enviada pelo cliente */}
              <img src={url} alt="Foto enviada pelo cliente" className="size-full object-cover" />
            </a>
          ))}
          {review.video_url && (
            <video
              src={review.video_url}
              controls
              className="h-16 w-28 rounded-md border border-border object-cover"
            />
          )}
        </div>
      )}
    </div>
  );
}
