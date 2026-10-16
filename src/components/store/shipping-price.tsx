import { formatPrice } from "@/lib/format";

/**
 * Mostra o preço riscado + "Grátis" quando o frete grátis (compras acima
 * do valor mínimo) zerou o valor da transportadora escolhida.
 */
export function ShippingPrice({ cost, originalCost }: { cost: number; originalCost: number }) {
  if (cost === 0 && originalCost > 0) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="text-muted-foreground line-through">{formatPrice(originalCost)}</span>
        <span className="font-semibold text-emerald-600">Grátis</span>
      </span>
    );
  }
  return <span>{formatPrice(cost)}</span>;
}
