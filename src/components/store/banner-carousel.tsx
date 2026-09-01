"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";

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
        <div className="absolute inset-0 flex flex-col justify-end gap-1.5 bg-gradient-to-t from-black/70 via-black/15 to-transparent p-4 sm:gap-2 sm:p-6 lg:p-10">
          {banner.title && (
            <h2 className="font-display text-lg font-semibold text-white sm:text-2xl lg:text-4xl">
              {banner.title}
            </h2>
          )}
          {banner.description && (
            <p className="line-clamp-2 max-w-md text-xs text-white/90 sm:text-sm lg:text-base">
              {banner.description}
            </p>
          )}
          {banner.button_label && (
            <span className="mt-1 inline-flex w-fit items-center rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground sm:mt-2 sm:px-4 sm:py-2 sm:text-sm">
              {banner.button_label}
            </span>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-muted sm:rounded-2xl">
      {banner.button_link ? (
        <Link
          href={banner.button_link}
          className="relative block aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]"
        >
          {bannerContent}
        </Link>
      ) : (
        <div className="relative block aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
          {bannerContent}
        </div>
      )}

      {banners.length > 1 && (
        <>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-3">
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
