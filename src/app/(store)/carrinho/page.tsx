"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { calculateShipping } from "@/lib/shipping";

export default function CarrinhoPage() {
  const { items, subtotal, setQuantity, removeItem, isHydrated } = useCart();
  const shipping = calculateShipping();

  if (isHydrated && items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <ShoppingBag className="size-12 text-muted-foreground" />
        <h1 className="font-display text-2xl font-semibold">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground">Explore nosso catálogo e encontre algo especial.</p>
        <Button asChild size="lg">
          <Link href="/produtos">Ver produtos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-semibold sm:text-3xl">Seu carrinho</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card
              key={`${item.productId}-${item.variationValue ?? ""}`}
              className="flex gap-4 p-4"
            >
              <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-muted">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/produto/${item.slug}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId, item.variationValue)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remover item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                {item.variationLabel && (
                  <span className="text-xs text-muted-foreground">
                    {item.variationLabel}: {item.variationValue}
                  </span>
                )}
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-md border border-input">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity - 1, item.variationValue)
                      }
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={item.quantity >= item.maxStock}
                      onClick={() =>
                        setQuantity(item.productId, item.quantity + 1, item.variationValue)
                      }
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  <span className="font-display text-base font-semibold">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="h-fit space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold">Resumo</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{shipping.label}</span>
              <span>{formatPrice(shipping.cost)}</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(subtotal + shipping.cost)}</span>
          </div>
          <Button asChild size="lg" className="w-full" disabled={items.length === 0}>
            <Link href="/checkout">Finalizar compra</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
