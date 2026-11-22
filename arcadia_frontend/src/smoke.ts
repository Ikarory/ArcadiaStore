import { AnchorProvider } from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { RPC_URL } from "./config/constants";
import { buildContainer } from "./container";

async function main() {
  const connection = new Connection(RPC_URL, "confirmed");

  // Wallet de mentira: solo para leer datos, no firma nada.
  const dummy = Keypair.generate();
  const wallet = {
    publicKey: dummy.publicKey,
    signTransaction: async (t: any) => t,
    signAllTransactions: async (t: any) => t,
  };
  const provider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });

  const { products } = buildContainer(provider, () => null);

  const list = await products.list();
  console.log(`Productos en la tienda: ${list.length}`);
  for (const p of list) {
    console.log(
      `#${p.id} ${p.name} | ${p.priceLamports / 1e9} SOL | stock ${p.stock} | ` +
        `${p.isIllegal ? "ILEGAL -> " + p.dropZone : "legal"}`
    );
  }
}

main().catch((e) => {
  console.error("Fallo la prueba:", e);
  process.exit(1);
});