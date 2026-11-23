import { useEffect, useState } from "react";
import type { MemorialView } from "../domain/models";
import { useServicios } from "../arcadia/context";
import { Ventana } from "../components/Ventana";
import { CODENAME, VERSION } from "../config/version";

// Ventana pequeña de arriba: edita estas líneas con tu información.
const INFO: string[] = [
  `Arcadia v${VERSION}: ${CODENAME}`,
  "-Añadimos el memorial, vendedores que hayan sido eliminados por la federación seran recordados aquí.", "-Página acerca de.", "-Corrección de errores.",
];

export default function AcercaDe() {
  const servicios = useServicios();
  const [nombres, setNombres] = useState<MemorialView[]>([]);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");

  useEffect(() => {
    if (!servicios) return;
    let cancelado = false;
    servicios.memorial
      .list()
      .then((lista) => {
        if (cancelado) return;
        setNombres(lista);
        setEstado("listo");
      })
      .catch(() => {
        if (!cancelado) setEstado("error");
      });
    return () => {
      cancelado = true;
    };
  }, [servicios]);

  return (
    <main className="page">
      <h2>&gt; acerca de</h2>

      <Ventana titulo="información">
        {INFO.map((linea, i) => (
          <p key={i}>{linea}</p>
        ))}
      </Ventana>

      <Ventana titulo="memorial">
        <div className="memorial">
          <p className="memorial-titulo">† MEMORIAL †</p>
          <p className="muted">ELIMINADOS POR LA FEDERACION</p>

          {estado === "cargando" && (
            <p>
              BUSCANDO EN LOS ARCHIVOS<span className="blink">_</span>
            </p>
          )}
          {estado === "error" && <p className="err">&gt; ARCHIVOS INACCESIBLES</p>}
          {estado === "listo" && nombres.length === 0 && (
            <p className="muted">NADIE... TODAVIA</p>
          )}

          {nombres.map((n) => (
            <p key={n.username}>
              † {n.username}{" "}
              <span className="muted">{new Date(n.deletedAt * 1000).toISOString().slice(0, 10)}</span>
            </p>
          ))}
        </div>
      </Ventana>
    </main>
  );
}