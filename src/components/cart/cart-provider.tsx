"use client";

import * as React from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  weightGrams: number;
  variationLabel?: string;
  variationValue?: string;
  maxStock: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variationValue?: string) => void;
  setQuantity: (productId: string, quantity: number, variationValue?: string) => void;
  clear: () => void;
  subtotal: number;
  totalWeightGrams: number;
  itemCount: number;
  isHydrated: boolean;
}

const CartContext = React.createContext<CartContextValue | null>(null);

const STORAGE_KEY = "santa-fe:cart";

function cartKey(productId: string, variationValue?: string) {
  return `${productId}::${variationValue ?? ""}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    // Hidratação única a partir do localStorage no mount do client — não é
    // um efeito colateral reativo, por isso o setState direto aqui é seguro.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage indisponível (modo privado) — carrinho começa vazio.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignora falha de escrita em localStorage
    }
  }, [items, isHydrated]);

  const addItem = React.useCallback<CartContextValue["addItem"]>((item, quantity = 1) => {
    setItems((current) => {
      const key = cartKey(item.productId, item.variationValue);
      const existing = current.find(
        (i) => cartKey(i.productId, i.variationValue) === key
      );

      if (existing) {
        const nextQuantity = Math.min(existing.quantity + quantity, existing.maxStock);
        return current.map((i) =>
          cartKey(i.productId, i.variationValue) === key
            ? { ...i, quantity: nextQuantity }
            : i
        );
      }

      return [...current, { ...item, quantity: Math.min(quantity, item.maxStock) }];
    });
  }, []);

  const removeItem = React.useCallback<CartContextValue["removeItem"]>(
    (productId, variationValue) => {
      setItems((current) =>
        current.filter(
          (i) => cartKey(i.productId, i.variationValue) !== cartKey(productId, variationValue)
        )
      );
    },
    []
  );

  const setQuantity = React.useCallback<CartContextValue["setQuantity"]>(
    (productId, quantity, variationValue) => {
      setItems((current) =>
        current
          .map((i) =>
            cartKey(i.productId, i.variationValue) === cartKey(productId, variationValue)
              ? { ...i, quantity: Math.max(0, Math.min(quantity, i.maxStock)) }
              : i
          )
          .filter((i) => i.quantity > 0)
      );
    },
    []
  );

  const clear = React.useCallback(() => setItems([]), []);

  const { subtotal, totalWeightGrams, itemCount } = React.useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        subtotal: acc.subtotal + item.unitPrice * item.quantity,
        totalWeightGrams: acc.totalWeightGrams + item.weightGrams * item.quantity,
        itemCount: acc.itemCount + item.quantity,
      }),
      { subtotal: 0, totalWeightGrams: 0, itemCount: 0 }
    );
  }, [items]);

  const value = React.useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      setQuantity,
      clear,
      subtotal,
      totalWeightGrams,
      itemCount,
      isHydrated,
    }),
    [items, addItem, removeItem, setQuantity, clear, subtotal, totalWeightGrams, itemCount, isHydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = React.useContext(CartContext);
  if (!context) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return context;
}
