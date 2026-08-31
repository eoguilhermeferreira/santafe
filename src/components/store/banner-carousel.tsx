"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Banner } from "@/types/database.types";

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[index];

  const bannerContent = (
    <>
      <Image
        src={banner.image_url}
        alt={banner.title ?? ""}
        fill
        priority={index === 0}
        sizes="100vw"
        className="object-cover"
      />
      {(banner.title || banner.description || banner.button_label) && (
        <div className="absolute inset-0 flex flex-col justify-end gap-2 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-6 sm:p-10">
          {banner.title && (
            <h2 className="font-display text-2xl font-semibold text-white sm:text-4xl">
              {banner.title}
            </h2>
          )}
          {banner.description && (
            <p className="max-w-md text-sm text-white/90 sm:text-base">{banner.description}</p>
          )}
          {banner.button_label && (
            <span className="mt-2 inline-flex w-fit items-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
              {banner.button_label}
            </span>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
      {banner.button_link ? (
        <Link
          href={banner.button_link}
          className="relative block aspect-[16/7] w-full sm:aspect-[21/7]"
        >
          {bannerContent}
        </Link>
      ) : (
        <div className="relative block aspect-[16/7] w-full sm:aspect-[21/7]">
          {bannerContent}
        </div>
      )}

      {banners.length > 1 && (
        <>
          <button
            aria-label="Banner anterior"
            onClick={() => setIndex((current) => (current - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow hover:bg-background"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            aria-label="Próximo banner"
            onClick={() => setIndex((current) => (current + 1) % banners.length)}
            className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow hover:bg-background"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                aria-label={`Ir para o banner ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
