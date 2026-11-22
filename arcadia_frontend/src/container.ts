import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { IDL, Arcadia } from "./idl/arcadia";
import { PROGRAM_ID } from "./config/constants";
import { PdaResolver } from "./core/PdaResolver";
import { ProfileService } from "./core/ProfileService";
import { ProductService } from "./core/ProductService";
import { PurchaseService } from "./core/PurchaseService";
import { TicketListener } from "./core/TicketListener";

export function buildContainer(provider: AnchorProvider, getWallet: () => PublicKey | null) {
const program = new Program<Arcadia>(IDL, PROGRAM_ID, provider);
  const pdas = new PdaResolver(program.programId);

  const wallet = new ProfileService(program, getWallet);
  const products = new ProductService(program, pdas, wallet);
  const purchases = new PurchaseService(program, pdas, products, wallet);
  const tickets = new TicketListener(program);

  return { wallet, products, purchases, tickets };
}