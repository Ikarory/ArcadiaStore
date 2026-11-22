import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ProductView, TicketView } from "../domain/models";
import { useServicios } from "../arcadia/context";
import { usePerfil } from "../arcadia/usePerfil";
import { useCarrito } from "../carrito/context";
import { Ventana } from "../components/Ventana";
import { formatoSol } from "../util/formato";

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
function conTiempo<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rechazar) =>
      setTimeout(() => rechazar(new Error("TIEMPO AGOTADO. REVISA PHANTOM")), ms)
    ),
  ]);
}

interface TicketConNombre extends TicketView {
  nombre: string;
}

export default function Carrito() {
  const servicios = useServicios();
  const { perfil, cargando: cargandoPerfil } = usePerfil();
  const { items, quitar } = useCarrito();

  const [productos, setProductos] = useState<ProductView[]>([]);
  const [cargando, setCargando] = useState(true);
  const [progreso, setProgreso] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketConNombre[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!servicios) return;
    let cancelado = false;
    servicios.products
      .list()
      .then((lista) => {
        if (!cancelado) setProductos(lista);
      })
      .catch(() => {
        if (!cancelado) setError("NO SE PUDO LEER EL MERCADO");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [servicios]);

  const lineas = items.flatMap((item) => {
    const prod = productos.find((p) => p.id === item.productoId);
    return prod ? [{ item, prod }] : [];
  });
  const total = lineas.reduce((s, l) => s + l.prod.priceLamports * l.item.cantidad, 0);

async function comprar() {
    console.log("comprar:", {
      servicios: !!servicios,
      perfil: perfil?.username,
      lineas: lineas.length,
    });
    if (!servicios || !perfil || lineas.length === 0) return;
    setError(null);
    const nuevos: TicketConNombre[] = [];
    try {
      for (let i = 0; i < lineas.length; i++) {
        const { item, prod } = lineas[i];
        setProgreso(`FIRMANDO ${i + 1}/${lineas.length}...`);
        
        console.log("enviando compra del producto", item.productoId);
        const t = await conTiempo(
          servicios.purchases.buy(item.productoId, item.cantidad, perfil.username),
          90_000
        );
        console.log("compra confirmada", t);
        nuevos.push({ ...t, nombre: prod.name });
        quitar(item.productoId);
        // devnet tarda en reflejar la compra anterior; esta pausa evita choques
        if (i < lineas.length - 1) await esperar(2000);
      }
        } catch (err) {
      console.error("Fallo la compra:", err);
      const msg = String(err);
      if (msg.includes("User rejected")) setError("FIRMA CANCELADA");
      else if (msg.includes("stock")) setError("UN PRODUCTO YA NO TIENE STOCK SUFICIENTE");
      else setError("NO SE PUDO COMPLETAR LA COMPRA: " + msg.slice(0, 160));
    } finally {
      setTickets((prev) => [...prev, ...nuevos]);
      setProgreso(null);
    }
  }

  return (
    <main className="page ancha">
      <h2>&gt; carrito</h2>

      {tickets.map((t) => (
        <Ventana key={t.id} titulo={`ticket #${t.id}`}>
          <p>
            {t.nombre} × {t.quantity}
          </p>
          <p className="precio">{formatoSol(t.totalLamports)}</p>
          <p className={t.isIllegal ? "err" : "muted"}>&gt; {t.notice}</p>
        </Ventana>
      ))}

      {cargando && <p>CARGANDO...</p>}

      {!cargando && lineas.length === 0 && (
        <p className="muted">
          EL CARRITO ESTA VACIO. <Link to="/tienda">ir a la tienda</Link>
        </p>
      )}

      {lineas.length > 0 && (
        <Ventana titulo="tu pedido">
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>producto</th>
                  <th className="num">cant.</th>
                  <th className="num">subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lineas.map(({ item, prod }) => (
                  <tr key={item.productoId}>
                    <td>
                      {prod.isIllegal && <b className="err">[!] </b>}
                      {prod.name}
                    </td>
                    <td className="num">{item.cantidad}</td>
                    <td className="num">{formatoSol(prod.priceLamports * item.cantidad)}</td>
                    <td className="num">
                      <button
                        className="btn"
                        disabled={progreso !== null}
                        onClick={() => quitar(item.productoId)}
                      >
                        [x]
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="precio">TOTAL: {formatoSol(total)}</p>

          {!cargandoPerfil && !perfil && (
            <p className="err">
              &gt; NECESITAS UNA CUENTA PARA COMPRAR. <Link to="/registro">crear cuenta</Link>
            </p>
          )}

          <button className="btn" disabled={!perfil || progreso !== null} onClick={comprar}>
            {progreso ?? "[ comprar ]"}
          </button>
        </Ventana>
      )}

      {error && <p className="err">&gt; {error}</p>}
    </main>
  );
}