import { createContext, useContext } from "react";
import type { PublicKey } from "@solana/web3.js";

export interface PhantomProvider {
  isPhantom?: boolean;
  publicKey: PublicKey | null;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  off(event: string, handler: (...args: unknown[]) => void): void;
}

export interface WalletState {
  provider: PhantomProvider | null;
  publicKey: PublicKey | null;
  hasPhantom: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const WalletContext = createContext<WalletState | null>(null);

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet debe usarse dentro de WalletProvider");
  return ctx;
}