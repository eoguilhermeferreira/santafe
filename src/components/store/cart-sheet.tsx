"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/format";

export function CartSheet() {
  const { items, itemCount, subtotal, setQuantity, removeItem, isHydrated } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Abrir carrinho" className="relative">
          <ShoppingBag />
          {isHydrated && itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Seu carrinho</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <ShoppingBag className="size-10" />
            <p>Seu carrinho está vazio.</p>
            <SheetClose asChild>
              <Button asChild variant="outline">
                <Link href="/produtos">Ver produtos</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto py-2">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variationValue ?? ""}`}
                  className="flex gap-3 border-b border-border pb-4"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <Link href={`/produto/${item.slug}`} className="text-sm font-medium hover:underline">
                      {item.name}
                    </Link>
                    {item.variationLabel && (
                      <span className="text-xs text-muted-foreground">
                        {item.variationLabel}: {item.variationValue}
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-7"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity - 1, item.variationValue)
                          }
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-7"
                          disabled={item.quantity >= item.maxStock}
                          onClick={() =>
                            setQuantity(item.productId, item.quantity + 1, item.variationValue)
                          }
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                      <span className="font-display text-sm font-semibold">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variationValue)}
                    className="self-start text-muted-foreground hover:text-destructive"
                    aria-label="Remover item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <SheetFooter className="gap-3 border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-display text-base font-semibold">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <SheetClose asChild>
                <Button asChild size="lg">
                  <Link href="/carrinho">Ver carrinho</Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
