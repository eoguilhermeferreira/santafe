"use client";

import * as React from "react";
import { Loader2, Truck } from "lucide-react";

import { getShippingOptions } from "@/app/(store)/checkout/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCep, formatPrice, onlyDigits } from "@/lib/format";
import type { ShippingOption } from "@/lib/melhor-envio";

/**
 * Calculadora de frete na página do produto — o cliente vê o valor
 * (pra 1 unidade) antes de decidir comprar, sem precisar ir até o
 * checkout. A cotação final por quantidade/combinação de produtos é
 * sempre reconferida no checkout.
 */
export function ShippingCalculator({ weightGrams }: { weightGrams: number }) {
  const [cep, setCep] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [options, setOptions] = React.useState<ShippingOption[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleCalculate(event: React.FormEvent) {
    event.preventDefault();
    const digits = onlyDigits(cep);
    if (digits.length !== 8) {
      setError("Informe um CEP válido");
      setOptions(null);
      return;
    }

    setError(null);
    setIsLoading(true);
    const result = await getShippingOptions(digits, weightGrams);
    setOptions(result);
    setIsLoading(false);
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <form onSubmit={handleCalculate} className="flex items-center gap-2">
        <Truck className="size-4 shrink-0 text-muted-foreground" />
        <Input
          value={formatCep(cep)}
          onChange={(e) => setCep(e.target.value)}
          placeholder="Seu CEP"
          inputMode="numeric"
          className="max-w-36"
        />
        <Button type="submit" variant="outline" size="sm" disabled={isLoading}>
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          Calcular frete
        </Button>
      </form>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      {options && options.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
          {options.map((option) => (
            <li key={option.id} className="flex justify-between gap-2">
              <span className="text-muted-foreground">{option.label}</span>
              <span>{formatPrice(option.cost)}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        Ou retire de graça na loja em Avaré/SP.
      </p>
    </div>
  );
}
