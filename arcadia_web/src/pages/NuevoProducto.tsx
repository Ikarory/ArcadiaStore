import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { NewProduct } from "../core/interfaces";
import { useServicios } from "../arcadia/context";
import { usePerfil } from "../arcadia/usePerfil";
import { Ventana } from "../components/Ventana";
import { esperar } from "../util/tiempo";

type Categoria = NewProduct["category"];
const CATEGORIAS: Categoria[] = ["retro", "roboparte", "protesis", "arma", "datos", "otro"];

export default function NuevoProducto() {
  const servicios = useServicios();
  const { perfil, cargando: cargandoPerfil } = usePerfil();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("retro");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("1");
  const [ilegal, setIlegal] = useState(false);
  const [zona, setZona] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const precioSol = Number(precio.replace(",", "."));
  const lamports = Math.round(precioSol * 1_000_000_000);
  const stockNum = Number(stock);

  const valido =
    nombre.trim().length > 0 &&
    Number.isFinite(precioSol) &&
    lamports > 0 &&
    Number.isInteger(stockNum) &&
    stockNum >= 0 &&
    stockNum <= 100000 &&
    (!ilegal || zona.trim().length > 0);

  async function publicar(e: FormEvent) {
    e.preventDefault();
    if (!servicios || !perfil || !valido) return;
    setEnviando(true);
    setError(null);
    try {
      await servicios.products.create(
        {
          name: nombre.trim(),
          description: descripcion.trim(),
          imageUri: "",
          category: categoria,
          priceLamports: lamports,
          stock: stockNum,
          isIllegal: ilegal,
          dropZone: ilegal ? zona.trim() : "",
        },
        perfil.username
      );
      await esperar(1500); // devnet tarda en reflejar la escritura
      navigate("/mis-productos");
    } catch (err) {
      console.error("Fallo la publicación:", err);
      setError(String(err).includes("User rejected") ? "FIRMA CANCELADA" : "NO SE PUDO PUBLICAR");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="page">
      <h2>&gt; añadir producto</h2>
      <Ventana titulo="nueva mercancía">
        {!cargandoPerfil && !perfil && (
          <p className="err">
            &gt; NECESITAS UNA CUENTA PARA VENDER. <Link to="/registro">crear cuenta</Link>
          </p>
        )}

        <form onSubmit={publicar}>
          <label className="campo">
            <span>nombre</span>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={40} autoComplete="off" />
          </label>

          <label className="campo">
            <span>descripción</span>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={200} rows={3} />
          </label>

          <label className="campo">
            <span>categoría</span>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="campo">
            <span>precio (SOL)</span>
            <input value={precio} onChange={(e) => setPrecio(e.target.value)} inputMode="decimal" placeholder="0.01" autoComplete="off" />
          </label>

          <label className="campo">
            <span>stock</span>
            <input value={stock} onChange={(e) => setStock(e.target.value)} inputMode="numeric" autoComplete="off" />
          </label>

          <label className="check">
            <input type="checkbox" checked={ilegal} onChange={(e) => setIlegal(e.target.checked)} />
            <span>PRODUCTO ILEGAL</span>
          </label>

          {ilegal && (
            <label className="campo">
              <span>zona de entrega (lejos de las zonas urbanas)</span>
              <input value={zona} onChange={(e) => setZona(e.target.value)} maxLength={60} autoComplete="off" />
            </label>
          )}

          <button className="btn" type="submit" disabled={!valido || enviando || !perfil}>
            {enviando ? "[ firmando... ]" : "[ publicar ]"}
          </button>
          {error && <p className="err">&gt; {error}</p>}
        </form>
      </Ventana>
      <p className="center"><Link to="/mis-productos">&lt; volver</Link></p>
    </main>
  );
}