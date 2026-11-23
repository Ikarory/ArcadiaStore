import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Tienda from "./pages/Tienda";
import Carrito from "./pages/Carrito";
import Perfil from "./pages/Perfil";
import AcercaDe from "./pages/AcercaDe";
import Federacion from "./pages/Federacion";
import EnDesarrollo from "./pages/EnDesarrollo";
import MisProductos from "./pages/MisProductos";
import NuevoProducto from "./pages/NuevoProducto";
import { RutaProtegida } from "./components/RutaProtegida";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* con barra superior */}
      <Route element={<RutaProtegida />}>
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/mis-productos" element={<MisProductos />} />
        <Route path="/acerca-de" element={<AcercaDe />} />
        <Route path="/federacion" element={<Federacion />} />
      </Route>

      {/* con wallet, pero sin barra */}
      <Route element={<RutaProtegida barra={false} />}>
        <Route path="/mis-productos/nuevo" element={<NuevoProducto />} />
      </Route>

      <Route path="*" element={<EnDesarrollo titulo="404" />} />
    </Routes>
  );
}