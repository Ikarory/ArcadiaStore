import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ventana } from "../components/Ventana";
import { useWallet } from "../wallet/context";
import { useServicios } from "../arcadia/context";

const NOMBRE_VALIDO = /^[a-zA-Z0-9_-]{3,20}$/;

export default function Registro() {
  const { publicKey, hasPhantom, connect, error: errorWallet } = useWallet();
  const servicios = useServicios();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [estado, setEstado] = useState<"revisando" | "libre" | "existe">("revisando");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ¿esta wallet ya tiene cuenta?
  useEffect(() => {
    if (!servicios || !publicKey) return;
    let cancelado = false;
    servicios.wallet
      .findProfile(publicKey)
      .then((p) => { if (!cancelado) setEstado(p ? "existe" : "libre"); })
      .catch(() => { if (!cancelado) setEstado("libre"); });
    return () => { cancelado = true; };
  }, [servicios, publicKey]);

  const nombreOk = NOMBRE_VALIDO.test(nombre);

  async function crear(e: FormEvent) {
    e.preventDefault();
    if (!servicios || !nombreOk) return;
    setEnviando(true);
    setError(null);
    try {
      await servicios.registration.register(nombre);
      navigate("/tienda");
    } catch (err) {
      const msg = String(err);
      setError(
        msg.includes("already in use") ? "ESE NOMBRE YA ESTA TOMADO" : "NO SE PUDO CREAR LA CUENTA"
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="page">
      <Ventana titulo="crear cuenta">
        <p className="muted">
          En estos tiempos de vigilancia 24/7 no pedimos contraseñas. Tu wallet firma por ti.
        </p>

        {!hasPhantom && (
          <p className="err">
            &gt; NO SE DETECTO PHANTOM.{" "}
            <a href="https://phantom.app" target="_blank" rel="noreferrer">INSTALAR</a>
          </p>
        )}

        {hasPhantom && !publicKey && (
          <>
            <p>&gt; PRIMERO IDENTIFICATE.</p>
            <button className="btn" onClick={connect}>[ conectar phantom ]</button>
            {errorWallet && <p className="err">&gt; {errorWallet}</p>}
          </>
        )}

        {publicKey && estado === "revisando" && (
          <p>BUSCANDO TU EXPEDIENTE<span className="blink">_</span></p>
        )}

        {publicKey && estado === "existe" && (
          <>
            <p>&gt; ESTA WALLET YA TIENE CUENTA.</p>
            <Link to="/tienda">[ entrar a la tienda ]</Link>
          </>
        )}

        {publicKey && estado === "libre" && (
          <form onSubmit={crear}>
            <label className="campo">
              <span>nombre</span>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoComplete="off"
              />
            </label>
            <p className="muted">3 a 20 caracteres: letras, números, _ y -</p>

            <label className="campo">
              <span>wallet</span>
              <input value={publicKey.toBase58()} readOnly />
            </label>

            <button className="btn" type="submit" disabled={!nombreOk || enviando}>
              {enviando ? "[ firmando... ]" : "[ crear cuenta ]"}
            </button>
            {error && <p className="err">&gt; {error}</p>}
          </form>
        )}
      </Ventana>
      <p className="center"><Link to="/login">&lt; volver</Link></p>
    </main>
  );
}