import { Program } from "@coral-xyz/anchor";
import { SystemProgram } from "@solana/web3.js";
import { Arcadia } from "../idl/arcadia";
import { TicketView } from "../domain/models";
import { IPurchaseService, IProductRepository, IWalletVerifier } from "./interfaces";
import { PdaResolver } from "./PdaResolver";

export class PurchaseService implements IPurchaseService {
  constructor(
    private readonly program: Program<Arcadia>,
    private readonly pdas: PdaResolver,
    private readonly products: IProductRepository,
    private readonly wallet: IWalletVerifier
  ) {}

  async buy(productId: number, quantity: number, buyerUsername: string): Promise<TicketView> {
    console.log("[buy] 1. inicio", { productId, quantity, buyerUsername });
    const buyer = this.wallet.requireWallet();

    const product = await this.products.get(productId);
    console.log("[buy] 2. producto leído:", product?.name);
    if (!product) throw new Error("El producto ya no existe");

    const store = await this.program.account.store.fetch(this.pdas.store());
    const ticketId = store.ticketCount.toNumber();
    const ticketAddr = this.pdas.ticket(ticketId);
    console.log("[buy] 3. ticket id:", ticketId);

    console.log("[buy] 4. pidiendo firma a Phantom...");
    await this.program.methods
      .buyProduct(quantity)
      .accounts({
        store: this.pdas.store(),
        product: product.address,
        ticket: ticketAddr,
        buyerProfile: this.pdas.profile(buyerUsername),
        authority: buyer,
        seller: product.seller,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("[buy] 5. transacción confirmada");

    const t = await this.program.account.ticket.fetch(ticketAddr);
    return {
      id: t.id.toNumber(),
      buyer: t.buyer,
      product: t.product,
      quantity: t.quantity,
      totalLamports: t.total.toNumber(),
      isIllegal: t.isIllegal,
      notice: t.notice,
    };
  }
}