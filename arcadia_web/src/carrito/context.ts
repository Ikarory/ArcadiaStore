import { createContext, useContext } from "react";

export interface ItemCarrito {
  productoId: number;
  cantidad: number;
}

export interface CarritoState {
  items: ItemCarrito[];
  totalUnidades: number;
  agregar: (productoId: number, stock: number) => void;
  quitar: (productoId: number) => void;
  vaciar: () => void;
}

export const CarritoContext = createContext<CarritoState | null>(null);

export function useCarrito(): CarritoState {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  return ctx;
}