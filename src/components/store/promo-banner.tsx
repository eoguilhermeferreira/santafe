import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface PromoBannerBaseProps {
  imageUrl: string;
  eyebrow?: string;
  title: string;
  description?: string;
  buttonLabel: string;
  href: string;
}

/**
 * CTA de conversão com imagem, usado para preencher os intervalos entre
 * seções da home. Duas variantes: `split` (imagem + texto lado a lado, boa
 * em pares) e `square` (imagem de fundo cheia com texto sobreposto).
 */
export function PromoBanner({
  imageUrl,
  eyebrow,
  title,
  description,
  buttonLabel,
  href,
  imageSide = "left",
}: PromoBannerBaseProps & { imageSide?: "left" | "right" }) {
  return (
    <Link
      href={href}
      className="group grid overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg sm:grid-cols-2"
    >
      <div
        className={cn(
          "relative aspect-[4/3] sm:aspect-auto",
          imageSide === "right" && "sm:order-2"
        )}
      >
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col justify-center gap-2 p-6 sm:p-8">
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-wide text-accent">
            {eyebrow}
          </span>
        )}
        <h3 className="font-display text-xl font-semibold sm:text-2xl">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        <span className="mt-2 flex items-center gap-1 text-sm font-semibold text-accent">
          {buttonLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function PromoSquareBanner({
  imageUrl,
  eyebrow,
  title,
  description,
  buttonLabel,
  href,
}: Partial<Pick<PromoBannerBaseProps, "buttonLabel" | "href">> &
  Omit<PromoBannerBaseProps, "buttonLabel" | "href">) {
  const className =
    "group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border sm:aspect-[16/10] lg:aspect-[16/9]";

  const content = (
    <>
      <Image
        src={imageUrl}
        alt=""
        fill
        sizes="100vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6 sm:p-10">
        {eyebrow && (
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
            {eyebrow}
          </span>
        )}
        <h3 className="max-w-md font-display text-2xl font-semibold text-white sm:text-4xl">
          {title}
        </h3>
        {description && (
          <p className="max-w-sm text-sm text-white/85 sm:text-base">{description}</p>
        )}
        {href && buttonLabel && (
          <span className="mt-1 flex items-center gap-1 rounded-md bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
            {buttonLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        )}
      </div>
    </>
  );

  if (!href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
