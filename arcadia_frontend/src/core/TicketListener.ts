import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Arcadia } from "../idl/arcadia";
import { TicketView } from "../domain/models";
import { ITicketNotifier } from "./interfaces";

export class TicketListener implements ITicketNotifier {
  private listenerId?: number;

  constructor(private readonly program: Program<Arcadia>) {}

  subscribe(buyer: PublicKey, onTicket: (t: TicketView) => void): void {
    this.listenerId = this.program.addEventListener("TicketIssued", (e) => {
      if (!e.buyer.equals(buyer)) return;
      onTicket({
        id: e.ticketId.toNumber(),
        buyer: e.buyer,
        product: e.product,
        quantity: 0, // el evento no lo trae; usa PurchaseService.buy si lo necesitas
        totalLamports: e.total.toNumber(),
        isIllegal: e.isIllegal,
        notice: e.notice,
      });
    });
  }

  async unsubscribe(): Promise<void> {
    if (this.listenerId !== undefined) {
      await this.program.removeEventListener(this.listenerId);
      this.listenerId = undefined;
    }
  }
}