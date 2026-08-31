"use client";

import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/database.types";

export function ProductGallery({
  images,
  alt,
  unavailable,
}: {
  images: ProductImage[];
  alt: string;
  unavailable?: boolean;
}) {
  const [active, setActive] = React.useState(0);
  const current = images[active];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
        {current ? (
          <Image
            src={current.url}
            alt={alt}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 90vw"
            className={cn("object-cover", unavailable && "grayscale")}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Sem imagem
          </div>
        )}
        {unavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="-rotate-12 rounded bg-foreground px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-background">
              Indisponível
            </span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, i) => (
            <button
              key={image.id}
              onClick={() => setActive(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md border-2",
                i === active ? "border-accent" : "border-transparent"
              )}
            >
              <Image src={image.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
