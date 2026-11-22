import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Arcadia } from "../idl/arcadia";
import { ProfileView } from "../domain/models";
import { IWalletVerifier } from "./interfaces";

export class ProfileService implements IWalletVerifier {
  constructor(
    private readonly program: Program<Arcadia>,
    private readonly getWallet: () => PublicKey | null
  ) {}

  requireWallet(): PublicKey {
    const wallet = this.getWallet();
    if (!wallet) throw new Error("Conecta tu wallet para entrar a Arcadia");
    return wallet;
  }

  async findProfile(wallet: PublicKey): Promise<ProfileView | null> {
    // El perfil se guarda con el nombre como seed, asi que se busca por el campo
    // `authority`, que va justo despues del discriminador (8 bytes).
    const found = await this.program.account.profile.all([
      { memcmp: { offset: 8, bytes: wallet.toBase58() } },
    ]);
    if (found.length === 0) return null;
    const { publicKey, account } = found[0];
    return { address: publicKey, username: account.username, wallet: account.authority };
  }
}