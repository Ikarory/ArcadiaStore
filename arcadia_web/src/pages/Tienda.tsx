import { useEffect, useMemo, useState } from "react";
import type { ProductView } from "../domain/models";
import { useServicios } from "../arcadia/context";
import { useCarrito } from "../carrito/context";
import { AsciiImagen } from "../components/AsciiImagen";
import { Ventana } from "../components/Ventana";
import { formatoSol } from "../util/formato";
import { Link } from "react-router-dom";

export default function Tienda() {
  const servicios = useServicios();
  const { items, agregar } = useCarrito();

  const [productos, setProductos] = useState<ProductView[]>([]);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (!servicios) return;
    let cancelado = false;
    servicios.products
      .list()
      .then((lista) => {
        if (cancelado) return;
        setProductos(lista.filter((p) => p.active).sort((a, b) => a.id - b.id));
        setEstado("listo");
      })
      .catch(() => {
        if (!cancelado) setEstado("error");
      });
    return () => {
      cancelado = true;
    };
  }, [servicios]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter((p) => p.name.toLowerCase().includes(q) || p.category.includes(q));
  }, [productos, busqueda]);

  const actual = visibles.find((p) => p.id === seleccionado) ?? visibles[0] ?? null;
  const enCarrito = actual ? (items.find((i) => i.productoId === actual.id)?.cantidad ?? 0) : 0;

  return (
    <main className="page ancha">
      <h2>
        &gt; catálogo<span className="blink">_</span>
      </h2>

      {estado === "cargando" && <p>CARGANDO MERCANCIA...</p>}
      {estado === "error" && <p className="err">&gt; NO SE PUDO LEER EL MERCADO. RECARGA.</p>}
      {estado === "listo" && productos.length === 0 && (
        <p className="muted">EL MERCADO ESTA VACIO.</p>
      )}

      {estado === "listo" && productos.length > 0 && (
        <div className="tienda">
          <Ventana titulo={actual ? actual.name : "detalle"}>
            {actual && (
              <>
                <AsciiImagen categoria={actual.category} ilegal={actual.isIllegal} />
                <p>{actual.description}</p>
                <p className="muted">
                  categoría: {actual.category} · stock: {actual.stock}
                </p>
                {actual.isIllegal && (
                  <p className="err">
                    &gt; PRODUCTO ILEGAL. ENTREGA EN ZONA ALEJADA: {actual.dropZone}
                  </p>
                )}
                <p className="precio">{formatoSol(actual.priceLamports)}</p>
                <button
                  className="btn"
                  disabled={actual.stock === 0 || enCarrito >= actual.stock}
                  onClick={() => agregar(actual.id, actual.stock)}
                >
                  {actual.stock === 0
                    ? "[ agotado ]"
                    : enCarrito >= actual.stock
                      ? "[ máximo en carrito ]"
                      : `[ añadir al carrito ]${enCarrito > 0 ? ` (${enCarrito})` : ""}`}
                </button>
                  {enCarrito > 0 && ( //abre
                  <p>
                    <Link to="/carrito">[ ir al carrito y comprar → ]</Link>
                  </p> //cierra codigo de acceso rapido a carrito
                  )} 
              </>
            )}
          </Ventana>

          <Ventana titulo="inventario">
            <label className="campo">
              <span>buscar</span>
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                autoComplete="off"
              />
            </label>
            <ul className="lista">
              {visibles.map((p) => (
                <li key={p.id}>
                  <button
                    className={actual?.id === p.id ? "item activo" : "item"}
                    onClick={() => setSeleccionado(p.id)}
                  >
                    <span>{p.name}</span>
                    <span>
                      {p.isIllegal && <b className="err">[!] </b>}
                      {formatoSol(p.priceLamports)}
                    </span>
                  </button>
                </li>
              ))}
              {visibles.length === 0 && <li className="muted">SIN RESULTADOS</li>}
            </ul>
          </Ventana>
        </div>
      )}
    </main>
  );
}