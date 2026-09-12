"use client";

import * as React from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

const SIZE_CLASSES = { sm: "size-3.5", md: "size-5", lg: "size-7" };

export function StarRating({
  value,
  onChange,
  size = "md",
  className,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const interactive = Boolean(onChange);
  const display = hovered ?? value;
  const Wrapper = interactive ? "button" : "span";

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role={interactive ? "radiogroup" : undefined}
      aria-label={interactive ? "Selecione de 1 a 5 estrelas" : `${value.toFixed(1)} de 5 estrelas`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent = Math.max(0, Math.min(1, display - (star - 1))) * 100;
        return (
          <Wrapper
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange?.(star) : undefined}
            onMouseEnter={interactive ? () => setHovered(star) : undefined}
            onMouseLeave={interactive ? () => setHovered(null) : undefined}
            className={cn("relative inline-flex", interactive && "cursor-pointer")}
            aria-label={interactive ? `${star} estrela${star > 1 ? "s" : ""}` : undefined}
          >
            <Star className={cn(SIZE_CLASSES[size], "text-muted-foreground/30")} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
              <Star fill="currentColor" className={cn(SIZE_CLASSES[size], "text-amber-400")} />
            </span>
          </Wrapper>
        );
      })}
    </div>
  );
}
