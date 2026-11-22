import { BN, Program } from "@coral-xyz/anchor";
import { SystemProgram } from "@solana/web3.js";
import { Arcadia } from "../idl/arcadia";
import { ProductView } from "../domain/models";
import {
  IProductRepository, IProductWriter, IWalletVerifier, NewProduct, ProductChanges,
} from "./interfaces";
import { PdaResolver } from "./PdaResolver";

export class ProductService implements IProductRepository, IProductWriter {
  constructor(
    private readonly program: Program<Arcadia>,
    private readonly pdas: PdaResolver,
    private readonly wallet: IWalletVerifier
  ) {}

  private toView(address: any, a: any): ProductView {
    return {
      address,
      id: a.id.toNumber(),
      seller: a.seller,
      name: a.name,
      description: a.description,
      imageUri: a.imageUri,
      category: Object.keys(a.category)[0],
      priceLamports: a.price.toNumber(),
      stock: a.stock,
      isIllegal: a.isIllegal,
      dropZone: a.dropZone,
      active: a.active,
    };
  }

  async list(): Promise<ProductView[]> {
    const all = await this.program.account.product.all();
    return all.map(({ publicKey, account }) => this.toView(publicKey, account));
  }

  async get(id: number): Promise<ProductView | null> {
    const addr = this.pdas.product(id);
    const acc = await this.program.account.product.fetchNullable(addr);
    return acc ? this.toView(addr, acc) : null;
  }

  async create(input: NewProduct, sellerUsername: string): Promise<number> {
    const seller = this.wallet.requireWallet();
    const store = await this.program.account.store.fetch(this.pdas.store());
    const id = store.productCount.toNumber();

    await this.program.methods
      .createProduct({
        name: input.name,
        description: input.description,
        imageUri: input.imageUri,
        category: { [input.category]: {} } as any,
        price: new BN(input.priceLamports),
        stock: input.stock,
        isIllegal: input.isIllegal,
        dropZone: input.dropZone,
      })
      .accounts({
        store: this.pdas.store(),
        product: this.pdas.product(id),
        profile: this.pdas.profile(sellerUsername),
        seller,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    return id;
  }

  async update(id: number, input: ProductChanges): Promise<void> {
    await this.program.methods
      .updateProduct({
        description: input.description,
        price: new BN(input.priceLamports),
        stock: input.stock,
        active: input.active,
        dropZone: input.dropZone,
      })
      .accounts({ product: this.pdas.product(id), seller: this.wallet.requireWallet() })
      .rpc();
  }

  async remove(id: number): Promise<void> {
    await this.program.methods
      .deleteProduct()
      .accounts({ product: this.pdas.product(id), seller: this.wallet.requireWallet() })
      .rpc();
  }
}