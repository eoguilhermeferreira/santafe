"use client";

import * as React from "react";

import { useCart } from "@/components/cart/cart-provider";

/**
 * Esvazia o carrinho quando a página de resultado do Checkout Pro carrega
 * (sucesso/pendente) — o pagamento agora acontece na página do Mercado
 * Pago, fora do nosso site, então não tem mais como chamar `clear()` antes
 * do redirect; isso só pode ser feito aqui, ao voltar.
 */
export function ClearCartOnMount() {
  const { clear } = useCart();

  React.useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
