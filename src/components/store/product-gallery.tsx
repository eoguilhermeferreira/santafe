"use client";

import Image from "next/image";
import * as React from "react";
import { ZoomIn } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const current = images[active];

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => current && setZoomOpen(true)}
        disabled={!current}
        className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted"
      >
        {current ? (
          <>
            <Image
              src={current.url}
              alt={alt}
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 90vw"
              className={cn("object-cover", unavailable && "grayscale")}
            />
            <span className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100">
              <ZoomIn className="size-4" />
            </span>
          </>
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
      </button>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
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

      {current && (
        <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
          <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none [&>button]:text-white [&>button]:opacity-100">
            <DialogTitle className="sr-only">{alt}</DialogTitle>
            <div className="relative aspect-square w-full overflow-hidden rounded-xl">
              <Image
                src={current.url}
                alt={alt}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
