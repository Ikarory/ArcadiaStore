import { createContext, useContext } from "react";
import type { buildContainer } from "../container";

export type Servicios = ReturnType<typeof buildContainer>;

export const ServiciosContext = createContext<Servicios | null>(null);

/** null mientras no haya wallet conectada. */
export function useServicios(): Servicios | null {
  return useContext(ServiciosContext);
}