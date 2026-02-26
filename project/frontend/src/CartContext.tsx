import { createContext, useContext, useState, ReactNode } from "react";
import { Product, CartItem } from "./api";

interface CartCtx {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  remove: (id: number) => void;
  update: (id: number, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const Ctx = createContext<CartCtx>(null!);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (p: Product, qty = 1) =>
    setItems((prev) => {
      const ex = prev.find((i) => i.product.id === p.id);
      if (ex) return prev.map((i) => i.product.id === p.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { product: p, quantity: qty }];
    });

  const remove = (id: number) => setItems((prev) => prev.filter((i) => i.product.id !== id));
  const update = (id: number, qty: number) =>
    setItems((prev) => qty <= 0 ? prev.filter((i) => i.product.id !== id)
      : prev.map((i) => i.product.id === id ? { ...i, quantity: qty } : i));
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return <Ctx.Provider value={{ items, add, remove, update, clear, total, count }}>{children}</Ctx.Provider>;
}

export const useCart = () => useContext(Ctx);
