import type { PublicKey } from "@solana/web3.js";

export const comoRestantes = (direcciones: PublicKey[]) =>
  direcciones.map((pubkey) => ({ pubkey, isWritable: true, isSigner: false }));