import { Link, NavLink } from "react-router-dom";
import { useEsAdmin } from "../arcadia/useEsAdmin";
import { useCarrito } from "../carrito/context";
import { useWallet } from "../wallet/context";

const ICONO = ["  /\\    ", " /  \\/\\ ", "/      \\"];

export function BarraSuperior() {
  const { totalUnidades, vaciar } = useCarrito();
  const { disconnect } = useWallet();
  const esAdmin = useEsAdmin();

  const clase = ({ isActive }: { isActive: boolean }) => (isActive ? "activo" : undefined);
  const claseCarrito = ({ isActive }: { isActive: boolean }) =>
    [isActive ? "activo" : "", totalUnidades > 0 ? "lleno" : ""].join(" ").trim() || undefined;

  function salir() {
    vaciar();
    void disconnect();
  }

  return (
    <header className="barra">
      <Link to="/tienda" className="barra-logo" title="volver a la tienda">
        <pre className="barra-icono">{ICONO.join("\n")}</pre>
        <span className="marca">ARCADIA</span>
      </Link>
      <nav>
        <NavLink to="/carrito" className={claseCarrito}>[carrito:{totalUnidades}]</NavLink>
        <NavLink to="/mis-productos" className={clase}>[mis productos]</NavLink>
        <NavLink to="/perfil" className={clase}>[perfil]</NavLink>
        <NavLink to="/acerca-de" className={clase}>[acerca de]</NavLink>
        {esAdmin === true && <NavLink to="/federacion" className={clase}>[federación]</NavLink>}
        <button className="btn" onClick={salir}>[salir]</button>
      </nav>
    </header>
  );
}