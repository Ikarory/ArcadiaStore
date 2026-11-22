import { useCallback, useMemo, useState, type ReactNode } from "react";
import { CarritoContext, type ItemCarrito } from "./context";

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);

  const agregar = useCallback((productoId: number, stock: number) => {
    setItems((prev) => {
      const actual = prev.find((i) => i.productoId === productoId);
      if (!actual) return stock > 0 ? [...prev, { productoId, cantidad: 1 }] : prev;
      return prev.map((i) =>
        i.productoId === productoId ? { ...i, cantidad: Math.min(i.cantidad + 1, stock) } : i
      );
    });
  }, []);

  const quitar = useCallback((productoId: number) => {
    setItems((prev) => prev.filter((i) => i.productoId !== productoId));
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  const totalUnidades = useMemo(() => items.reduce((s, i) => s + i.cantidad, 0), [items]);

  const value = useMemo(
    () => ({ items, totalUnidades, agregar, quitar, vaciar }),
    [items, totalUnidades, agregar, quitar, vaciar]
  );

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
}