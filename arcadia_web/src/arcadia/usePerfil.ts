import { useEffect, useState } from "react";
import type { ProfileView } from "../domain/models";
import { useWallet } from "../wallet/context";
import { useServicios } from "./context";

export function usePerfil() {
  const servicios = useServicios();
  const { publicKey } = useWallet();
  const [perfil, setPerfil] = useState<ProfileView | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!servicios || !publicKey) return;
    let cancelado = false;
    servicios.wallet
      .findProfile(publicKey)
      .then((p) => {
        if (!cancelado) setPerfil(p);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [servicios, publicKey]);

  return { perfil, cargando };
}