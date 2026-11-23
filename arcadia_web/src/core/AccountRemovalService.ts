import { Program } from "@coral-xyz/anchor";
import { SystemProgram } from "@solana/web3.js";
import { Arcadia } from "../idl/arcadia";
import { MAX_PRODUCTOS_POR_BAJA } from "../config/constants";
import { IAccountRemoval, IProductRepository, IWalletVerifier } from "./interfaces";
import { PdaResolver } from "./PdaResolver";
import { comoRestantes } from "./remaining";

export class AccountRemovalService implements IAccountRemoval {
  constructor(
    private readonly program: Program<Arcadia>,
    private readonly pdas: PdaResolver,
    private readonly products: IProductRepository,
    private readonly wallet: IWalletVerifier
  ) {}

  async deleteOwn(username: string): Promise<{ aMemorial: boolean }> {
    const authority = this.wallet.requireWallet();
    const mios = (await this.products.list()).filter((p) => p.seller.equals(authority));
    const hayIlegales = mios.some((p) => p.isIllegal);

    if (!hayIlegales) {
      await this.program.methods
        .deleteProfile()
        .accounts({ profile: this.pdas.profile(username), authority })
        .rpc();
      return { aMemorial: false };
    }

    if (mios.length > MAX_PRODUCTOS_POR_BAJA) throw new Error("DEMASIADOS_PRODUCTOS");

    await this.program.methods
      .deleteProfileMemorial()
      .accounts({
        store: this.pdas.store(),
        profile: this.pdas.profile(username),
        memorial: this.pdas.memorial(username),
        refund: authority,
        signer: authority,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(comoRestantes(mios.map((p) => p.address)))
      .rpc();
    return { aMemorial: true };
  }
}