import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Arcadia } from "../idl/arcadia";
import { MAX_PRODUCTOS_POR_BAJA } from "../config/constants";
import { UsuarioResumen } from "../domain/models";
import { IFederation, IProductRepository, IWalletVerifier } from "./interfaces";
import { PdaResolver } from "./PdaResolver";
import { comoRestantes } from "./remaining";

export class FederationService implements IFederation {
  constructor(
    private readonly program: Program<Arcadia>,
    private readonly pdas: PdaResolver,
    private readonly products: IProductRepository,
    private readonly wallet: IWalletVerifier
  ) {}

  async adminWallet(): Promise<PublicKey> {
    const store = await this.program.account.store.fetch(this.pdas.store());
    return store.admin;
  }

  async listUsers(): Promise<UsuarioResumen[]> {
    const [perfiles, productos] = await Promise.all([
      this.program.account.profile.all(),
      this.products.list(),
    ]);
    return perfiles
      .map(({ account }) => {
        const suyos = productos.filter((p) => p.seller.equals(account.authority));
        return {
          username: account.username,
          wallet: account.authority,
          productos: suyos.length,
          ilegales: suyos.filter((p) => p.isIllegal).length,
        };
      })
      .sort((a, b) => b.ilegales - a.ilegales || a.username.localeCompare(b.username));
  }

  async eliminar(username: string): Promise<void> {
    const admin = this.wallet.requireWallet();
    const perfil = await this.program.account.profile.fetch(this.pdas.profile(username));
    const suyos = (await this.products.list()).filter((p) => p.seller.equals(perfil.authority));
    if (suyos.length > MAX_PRODUCTOS_POR_BAJA) throw new Error("DEMASIADOS_PRODUCTOS");

    await this.program.methods
      .deleteProfileMemorial()
      .accounts({
        store: this.pdas.store(),
        profile: this.pdas.profile(username),
        memorial: this.pdas.memorial(username),
        refund: perfil.authority,
        signer: admin,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(comoRestantes(suyos.map((p) => p.address)))
      .rpc();
  }
}