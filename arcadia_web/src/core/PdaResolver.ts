import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export class PdaResolver {
  constructor(private readonly programId: PublicKey) {}

  private u64(n: number): Buffer {
    return new BN(n).toArrayLike(Buffer, "le", 8);
  }

  private find(seeds: Buffer[]): PublicKey {
    return PublicKey.findProgramAddressSync(seeds, this.programId)[0];
  }

  store(): PublicKey { return this.find([Buffer.from("store")]); }
  profile(username: string): PublicKey {
    return this.find([Buffer.from("profile"), Buffer.from(username)]);
  }
  product(id: number): PublicKey { return this.find([Buffer.from("product"), this.u64(id)]); }
  ticket(id: number): PublicKey { return this.find([Buffer.from("ticket"), this.u64(id)]); }
}