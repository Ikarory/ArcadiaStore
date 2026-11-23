import { useEffect, useState } from "react";
import { useWallet } from "../wallet/context";
import { useServicios } from "./context";

/** null mientras se comprueba. */
export function useEsAdmin(): boolean | null {
  const servicios = useServicios();
  const { publicKey } = useWallet();
  const [esAdmin, setEsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!servicios || !publicKey) return;
    let cancelado = false;
    servicios.federation
      .adminWallet()
      .then((admin) => {
        if (!cancelado) setEsAdmin(admin.equals(publicKey));
      })
      .catch(() => {
        if (!cancelado) setEsAdmin(false);
      });
    return () => {
      cancelado = true;
    };
  }, [servicios, publicKey]);

  return esAdmin;
}