import { Program } from "@coral-xyz/anchor";
import { Arcadia } from "../idl/arcadia";
import { MemorialView } from "../domain/models";
import { IMemorialRepository } from "./interfaces";

export class MemorialService implements IMemorialRepository {
  constructor(private readonly program: Program<Arcadia>) {}

  async list(): Promise<MemorialView[]> {
    const todos = await this.program.account.memorialEntry.all();
    return todos
      .map(({ account }) => ({
        username: account.username,
        deletedAt: account.deletedAt.toNumber(),
      }))
      .sort((a, b) => a.deletedAt - b.deletedAt);
  }
}