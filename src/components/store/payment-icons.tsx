import { BoletoBadge, PixBadge } from "@/components/icons/payment-badges";

const CARD_BRANDS = [
  { name: "Visa", src: "/payment-icons/visa.svg" },
  { name: "Mastercard", src: "/payment-icons/mastercard.svg" },
  { name: "Elo", src: "/payment-icons/elo.svg" },
  { name: "Hipercard", src: "/payment-icons/hipercard.svg" },
  { name: "American Express", src: "/payment-icons/amex.svg" },
];

/** Fileira de bandeiras/formas de pagamento aceitas, no formato de cartão. */
export function PaymentIcons() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PixBadge className="h-6 w-auto rounded-md" />
      {CARD_BRANDS.map((brand) => (
        // eslint-disable-next-line @next/next/no-img-element -- SVG decorativo local, next/image exigiria dangerouslyAllowSVG
        <img
          key={brand.name}
          src={brand.src}
          alt={brand.name}
          className="h-6 w-auto rounded-md"
        />
      ))}
      <BoletoBadge className="h-6 w-auto rounded-md" />
    </div>
  );
}
