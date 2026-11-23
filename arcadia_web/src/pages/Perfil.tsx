import { useState } from "react";
import { Link } from "react-router-dom";
import { AVATARES } from "../components/avatares";
import { Ventana } from "../components/Ventana";
import { useServicios } from "../arcadia/context";
import { usePerfil } from "../arcadia/usePerfil";
import { useWallet } from "../wallet/context";
import { esperar } from "../util/tiempo";

const clave = (wallet: string) => `arcadia:avatar:${wallet}`;

function leerAvatar(wallet: string): number {
  try {
    const v = Number(localStorage.getItem(clave(wallet)));
    return Number.isInteger(v) && v >= 0 && v < AVATARES.length ? v : 0;
  } catch {
    return 0;
  }
}

export default function Perfil() {
  const { publicKey, disconnect } = useWallet();
  const servicios = useServicios();
  const { perfil, cargando } = usePerfil();
  const wallet = publicKey?.toBase58() ?? "";

  const [indice, setIndice] = useState(() => leerAvatar(wallet));
  const [cambiando, setCambiando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null);

  function elegir(i: number) {
    setIndice(i);
    try {
      localStorage.setItem(clave(wallet), String(i));
    } catch {
      /* sin almacenamiento disponible */
    }
  }

  async function borrarCuenta() {
    if (!servicios || !perfil) return;
    if (!window.confirm("¿Borrar tu cuenta? Es permanente.")) return;
    setBorrando(true);
    setErrorBorrado(null);
    try {
      const { aMemorial } = await servicios.removal.deleteOwn(perfil.username);
      await esperar(1500);
      window.alert(
        aMemorial
          ? "LA FEDERACION TE ENCONTRO.\nTU NOMBRE QUEDA EN EL MEMORIAL."
          : "CUENTA ELIMINADA.\nNUNCA ESTUVISTE AQUI."
      );
      await disconnect();
    } catch (err) {
      console.error("Fallo el borrado de cuenta:", err);
      const msg = String(err);
      if (msg.includes("User rejected")) setErrorBorrado("FIRMA CANCELADA");
      else if (msg.includes("DEMASIADOS_PRODUCTOS"))
        setErrorBorrado("TIENES DEMASIADOS PRODUCTOS. BORRA ALGUNOS EN MIS PRODUCTOS");
      else setErrorBorrado("NO SE PUDO BORRAR LA CUENTA");
    } finally {
      setBorrando(false);
    }
  }

  return (
    <main className="page">
      <h2>&gt; perfil</h2>

      <Ventana titulo="expediente">
        <div className="perfil">
          <pre className="avatar">{AVATARES[indice].lineas.join("\n")}</pre>
          <div>
            <p className="muted">NOMBRE</p>
            {cargando ? (
              <p>...</p>
            ) : perfil ? (
              <p>{perfil.username}</p>
            ) : (
              <p className="err">
                SIN CUENTA. <Link to="/registro">crear cuenta</Link>
              </p>
            )}
            <p className="muted">WALLET</p>
            <p className="wallet">{wallet}</p>
          </div>
        </div>
      </Ventana>

      <Ventana titulo="elegir avatar">
        <div className="opciones">
          {AVATARES.map((a, i) => (
            <button
              key={a.nombre}
              className={i === indice ? "btn sel" : "btn"}
              onClick={() => elegir(i)}
            >
              [{a.nombre}]
            </button>
          ))}
        </div>
        <p className="muted">El avatar se guarda solo en este navegador.</p>
      </Ventana>

      <Ventana titulo="cambiar wallet">
        {!cambiando ? (
          <button className="btn" onClick={() => setCambiando(true)}>
            [ cambiar wallet ]
          </button>
        ) : (
          <>
            <p>
              EN DESARROLLO<span className="blink">_</span>
            </p>
            <p className="muted">
              Cambiar de wallet exige dos firmas: la actual y la nueva. Lo armamos en un paso aparte.
            </p>
          </>
        )}
      </Ventana>

      {perfil && (
        <Ventana titulo="borrar cuenta">
          <p className="muted">
            Es permanente. Recuperas la renta de tu cuenta. Los productos que tengas a la venta
            siguen ahí: bórralos antes en [mis productos].
          </p>
          <button className="btn" disabled={borrando} onClick={borrarCuenta}>
            {borrando ? "[ firmando... ]" : "[ borrar cuenta ]"}
          </button>
          {errorBorrado && <p className="err">&gt; {errorBorrado}</p>}
        </Ventana>
      )}
    </main>
  );
}