import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PublicKey } from "@solana/web3.js";
import { WalletContext, type PhantomProvider } from "./context";

function getPhantom(): PhantomProvider | null {
  const w = window as unknown as { phantom?: { solana?: PhantomProvider } };
  const p = w.phantom?.solana;
  return p?.isPhantom ? p : null;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const provider = useMemo(getPhantom, []);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provider) return;
    // reconecta en silencio si ya diste permiso antes
    provider.disconnect().catch(() => {});

    const onDisconnect = () => setPublicKey(null);
    const onAccountChanged = (pk: unknown) => setPublicKey((pk as PublicKey) ?? null);
    provider.on("disconnect", onDisconnect);
    provider.on("accountChanged", onAccountChanged);
    return () => {
      provider.off("disconnect", onDisconnect);
      provider.off("accountChanged", onAccountChanged);
    };
  }, [provider]);

  const connect = useCallback(async () => {
    setError(null);
    if (!provider) {
      setError("NO SE DETECTO PHANTOM");
      return;
    }
    try {
      const r = await provider.connect();
      setPublicKey(r.publicKey);
    } catch {
      setError("CONEXION RECHAZADA");
    }
  }, [provider]);

  const disconnect = useCallback(async () => {
    await provider?.disconnect();
    setPublicKey(null);
  }, [provider]);

  return (
    <WalletContext.Provider
      value={{ provider, publicKey, hasPhantom: provider !== null, error, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}