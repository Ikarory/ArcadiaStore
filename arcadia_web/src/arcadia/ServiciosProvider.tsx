import { useMemo, type ReactNode } from "react";
import { AnchorProvider, type Wallet } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import { RPC_URL } from "../config/constants";
import { buildContainer } from "../container";
import { useWallet } from "../wallet/context";
import { ServiciosContext } from "./context";

export function ServiciosProvider({ children }: { children: ReactNode }) {
  const { provider, publicKey } = useWallet();

  const servicios = useMemo(() => {
    if (!provider || !publicKey) return null;
    const connection = new Connection(RPC_URL, "confirmed");
    const anchorProvider = new AnchorProvider(connection, provider as unknown as Wallet, {
      commitment: "confirmed",
    });
    return buildContainer(anchorProvider, () => publicKey);
  }, [provider, publicKey]);

  return <ServiciosContext.Provider value={servicios}>{children}</ServiciosContext.Provider>;
}