const ANCHO = 24;

function linea(texto: string): string {
  const interior = ANCHO - 2;
  const centrado = texto.padStart(Math.floor((interior + texto.length) / 2)).padEnd(interior);
  return `|${centrado}|`;
}

export function AsciiImagen({ categoria, ilegal }: { categoria: string; ilegal: boolean }) {
  const borde = `+${"-".repeat(ANCHO - 2)}+`;
  const filas = [
    borde,
    linea(""),
    linea("[ SIN IMAGEN ]"),
    linea(categoria.toUpperCase()),
    linea(ilegal ? "!! ILEGAL !!" : ""),
    linea(""),
    borde,
  ];
  return <pre className={ilegal ? "ascii-img ilegal" : "ascii-img"}>{filas.join("\n")}</pre>;
}