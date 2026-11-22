import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "../wallet/context";
import { Logo } from "../components/Logo";
import { Ventana } from "../components/Ventana";

export default function Login() {
  const { publicKey, hasPhantom, connect, error } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (publicKey) navigate("/tienda");
  }, [publicKey, navigate]);

  return (
    <main className="page">
      <Logo />
      <p className="muted center">// el mercado de la nada //</p>

      <Ventana titulo="access.ink">
        <p>&gt; IDENTIFICATE, USUARIO.</p>
        <p className="muted">Tu wallet es tu identidad. Aquí no hay contraseñas, solo firmas.</p>
        {hasPhantom ? (
          <button className="btn" onClick={connect}>[ conectar phantom ]</button>
        ) : (
          <p className="err">
            &gt; NO SE DETECTO PHANTOM.{" "}
            <a href="https://phantom.app" target="_blank" rel="noreferrer">INSTALAR</a>
          </p>
        )}
        {error && <p className="err">&gt; {error}</p>}
      </Ventana>

      <p className="muted center">
        ¿primera vez? <Link to="/registro">crear cuenta</Link>
      </p>
    </main>
  );
}