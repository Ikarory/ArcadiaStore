import type { ReactNode } from "react";

export function Ventana({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="ventana">
      <div className="ventana-titulo">{titulo}</div>
      <div className="ventana-cuerpo">{children}</div>
    </section>
  );
}