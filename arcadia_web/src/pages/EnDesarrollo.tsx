import { Link } from "react-router-dom";
import { Ventana } from "../components/Ventana";

export default function EnDesarrollo({ titulo }: { titulo: string }) {
  return (
    <main className="page">
      <Ventana titulo={titulo}>
        <p>
          FUNCION_NO_DISPONIBLE<span className="blink">_</span>
        </p>
        <p className="muted">Nuestro equipo esta trabajando para esta funcion en el futuro.</p>
        <Link to="/login">&lt; volver</Link>
      </Ventana>
    </main>
  );
}