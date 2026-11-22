import { Navigate, Outlet } from "react-router-dom";
import { useWallet } from "../wallet/context";
import { BarraSuperior } from "./BarraSuperior";

export function RutaProtegida({ barra = true }: { barra?: boolean }) {
  const { publicKey } = useWallet();
  if (!publicKey) return <Navigate to="/login" replace />;
  return (
    <>
      {barra && <BarraSuperior />}
      <Outlet />
    </>
  );
}