import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ProductView } from "../domain/models";
import { useServicios } from "../arcadia/context";
import { useWallet } from "../wallet/context";
import { Ventana } from "../components/Ventana";
import { formatoSol } from "../util/formato";

export default function MisProductos() {
  const servicios = useServicios();
  const { publicKey } = useWallet();

  const [productos, setProductos] = useState<ProductView[]>([]);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [borrando, setBorrando] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!servicios || !publicKey) return;
    let cancelado = false;
    servicios.products
      .list()
      .then((lista) => {
        if (cancelado) return;
        setProductos(lista.filter((p) => p.seller.equals(publicKey)).sort((a, b) => a.id - b.id));
        setEstado("listo");
      })
      .catch(() => {
        if (!cancelado) setEstado("error");
      });
    return () => {
      cancelado = true;
    };
  }, [servicios, publicKey]);

  async function borrar(p: ProductView) {
    if (!servicios) return;
    if (!window.confirm(`¿Borrar "${p.name}"? No se puede deshacer.`)) return;
    setBorrando(p.id);
    setError(null);
    try {
      await servicios.products.remove(p.id);
      setProductos((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      console.error("Fallo el borrado:", err);
      setError(String(err).includes("User rejected") ? "FIRMA CANCELADA" : "NO SE PUDO BORRAR");
    } finally {
      setBorrando(null);
    }
  }

  return (
    <main className="page ancha">
      <h2>&gt; mis productos</h2>
      <p>
        <Link className="btn" to="/mis-productos/nuevo">[ añadir producto ]</Link>
      </p>

      {estado === "cargando" && (
        <p>BUSCANDO TU MERCANCIA<span className="blink">_</span></p>
      )}
      {estado === "error" && <p className="err">&gt; NO SE PUDO LEER EL MERCADO. RECARGA.</p>}
      {estado === "listo" && productos.length === 0 && (
        <p className="muted">NO TIENES NADA A LA VENTA.</p>
      )}

      {productos.length > 0 && (
        <Ventana titulo="a la venta">
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>producto</th>
                  <th className="num">stock</th>
                  <th className="num">precio</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.isIllegal && <b className="err">[!] </b>}
                      {p.name}
                      {!p.active && <span className="muted"> (pausado)</span>}
                    </td>
                    <td className="num">{p.stock}</td>
                    <td className="num">{formatoSol(p.priceLamports)}</td>
                    <td className="num">
                      <button className="btn" disabled={borrando !== null} onClick={() => borrar(p)}>
                        {borrando === p.id ? "[...]" : "[borrar]"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Ventana>
      )}

      {error && <p className="err">&gt; {error}</p>}
    </main>
  );
}