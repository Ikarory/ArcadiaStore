import { Program } from "@coral-xyz/anchor";
import { SystemProgram } from "@solana/web3.js";
import { Arcadia } from "../idl/arcadia";
import { IRegistrationService, IWalletVerifier } from "./interfaces";
import { PdaResolver } from "./PdaResolver";

export class RegistrationService implements IRegistrationService {
  constructor(
    private readonly program: Program<Arcadia>,
    private readonly pdas: PdaResolver,
    private readonly wallet: IWalletVerifier
  ) {}

  async register(username: string): Promise<void> {
    const authority = this.wallet.requireWallet();
    await this.program.methods
      .createProfile(username)
      .accounts({
        profile: this.pdas.profile(username),
        authority,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }
}