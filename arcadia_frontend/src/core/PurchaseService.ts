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
    const buyer = this.wallet.requireWallet();
    const product = await this.products.get(productId);
    if (!product) throw new Error("El producto ya no existe");

    const store = await this.program.account.store.fetch(this.pdas.store());
    const ticketId = store.ticketCount.toNumber();
    const ticketAddr = this.pdas.ticket(ticketId);

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