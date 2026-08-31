"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductWithRelations } from "@/types/database.types";

export function AddToCart({ product }: { product: ProductWithRelations }) {
  const router = useRouter();
  const { addItem } = useCart();
  const hasVariations = product.product_variations.length > 0;
  const [variationId, setVariationId] = React.useState(
    hasVariations ? product.product_variations[0].id : null
  );
  const [quantity, setQuantity] = React.useState(1);

  const selectedVariation = product.product_variations.find((v) => v.id === variationId);
  const stock = hasVariations ? selectedVariation?.stock ?? 0 : product.stock;
  const canBuy = product.is_active && stock > 0;
  const unitPrice = product.promo_price ?? product.price;

  function addToCart() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: product.product_images[0]?.url ?? null,
        unitPrice,
        weightGrams: product.weight_grams,
        maxStock: stock,
        variationLabel: selectedVariation?.label,
        variationValue: selectedVariation?.value,
      },
      quantity
    );
  }

  function handleAdd() {
    if (!canBuy) return;
    addToCart();
    toast.success("Adicionado ao carrinho", { description: product.name });
  }

  function handleBuyNow() {
    if (!canBuy) return;
    addToCart();
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col gap-4">
      {hasVariations && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{product.product_variations[0].label}</span>
          <div className="flex flex-wrap gap-2">
            {product.product_variations.map((variation) => (
              <button
                key={variation.id}
                onClick={() => {
                  setVariationId(variation.id);
                  setQuantity(1);
                }}
                disabled={variation.stock <= 0}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-colors",
                  variation.id === variationId
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input hover:bg-secondary",
                  variation.stock <= 0 && "cursor-not-allowed opacity-40 line-through"
                )}
              >
                {variation.value}
              </button>
            ))}
          </div>
        </div>
      )}

      {canBuy ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border border-input">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <Button size="lg" variant="outline" className="flex-1" onClick={handleAdd}>
              <ShoppingBag /> Adicionar ao carrinho
            </Button>
          </div>
          <Button size="lg" className="w-full" onClick={handleBuyNow}>
            Comprar agora
          </Button>
        </div>
      ) : (
        <Button size="lg" disabled className="w-full">
          {product.is_active ? "Sem estoque" : "Produto indisponível"}
        </Button>
      )}

      {canBuy && stock <= 5 && (
        <p className="text-xs text-accent-foreground/80">Últimas {stock} unidades!</p>
      )}
    </div>
  );
}
