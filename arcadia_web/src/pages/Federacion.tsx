import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { UsuarioResumen } from "../domain/models";
import { useServicios } from "../arcadia/context";
import { useEsAdmin } from "../arcadia/useEsAdmin";
import { Ventana } from "../components/Ventana";
import { acortarWallet } from "../util/formato";
import { esperar } from "../util/tiempo";

export default function Federacion() {
  const servicios = useServicios();
  const esAdmin = useEsAdmin();

  const [usuarios, setUsuarios] = useState<UsuarioResumen[]>([]);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!servicios) return;
    try {
      setUsuarios(await servicios.federation.listUsers());
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }, [servicios]);

  useEffect(() => {
    if (esAdmin) void cargar();
  }, [esAdmin, cargar]);

  async function eliminar(u: UsuarioResumen) {
    if (!servicios) return;
    const aviso = `La Federación eliminará a "${u.username}" y confiscará ${u.productos} producto(s). ¿Proceder?`;
    if (!window.confirm(aviso)) return;
    setTrabajando(u.username);
    setError(null);
    try {
      await servicios.federation.eliminar(u.username);
      await esperar(1500); // devnet tarda en reflejar la escritura
      await cargar();
    } catch (err) {
      console.error("Fallo la eliminación:", err);
      const msg = String(err);
      if (msg.includes("User rejected")) setError("FIRMA CANCELADA");
      else if (msg.includes("DEMASIADOS_PRODUCTOS")) setError("TIENE DEMASIADOS PRODUCTOS PARA UNA SOLA OPERACION");
      else setError("NO SE PUDO ELIMINAR");
    } finally {
      setTrabajando(null);
    }
  }

  if (esAdmin === false) return <Navigate to="/tienda" replace />;
  if (esAdmin === null) {
    return (
      <main className="page">
        <p>...</p>
      </main>
    );
  }

  return (
    <main className="page ancha">
      <h2>&gt; federación</h2>
      <p className="muted">ARCHIVO RESERVADO. SOLO PERSONAL AUTORIZADO.</p>

      {estado === "cargando" && <p>CONSULTANDO EXPEDIENTES<span className="blink">_</span></p>}
      {estado === "error" && <p className="err">&gt; EXPEDIENTES INACCESIBLES. RECARGA.</p>}

      {estado === "listo" && (
        <Ventana titulo="usuarios registrados">
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>usuario</th>
                  <th>wallet</th>
                  <th className="num">prod.</th>
                  <th className="num">ilegales</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.username}>
                    <td>{u.ilegales > 0 && <b className="err">[!] </b>}{u.username}</td>
                    <td className="muted">{acortarWallet(u.wallet.toBase58())}</td>
                    <td className="num">{u.productos}</td>
                    <td className="num">{u.ilegales}</td>
                    <td className="num">
                      <button className="btn" disabled={trabajando !== null} onClick={() => eliminar(u)}>
                        {trabajando === u.username ? "[...]" : "[eliminar]"}
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