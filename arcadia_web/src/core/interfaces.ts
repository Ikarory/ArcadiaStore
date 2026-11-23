import { PublicKey } from "@solana/web3.js";
import { ProductView, ProfileView, TicketView, MemorialView, UsuarioResumen } from "../domain/models";

export interface IWalletVerifier {
  /** Wallet conectada, o lanza error si no hay. */
  requireWallet(): PublicKey;
  /** Perfil asociado a esa wallet, o null si no se ha registrado. */
  findProfile(wallet: PublicKey): Promise<ProfileView | null>;
}

export interface IProductRepository {
  list(): Promise<ProductView[]>;
  get(id: number): Promise<ProductView | null>;
}

export interface IProductWriter {
  create(input: NewProduct, sellerUsername: string): Promise<number>;
  update(id: number, input: ProductChanges): Promise<void>;
  remove(id: number): Promise<void>;
}

export interface IPurchaseService {
  buy(productId: number, quantity: number, buyerUsername: string): Promise<TicketView>;
}

export interface ITicketNotifier {
  subscribe(buyer: PublicKey, onTicket: (t: TicketView) => void): void;
  unsubscribe(): Promise<void>;
}

export interface NewProduct {
  name: string;
  description: string;
  imageUri: string;
  category: "retro" | "roboparte" | "protesis" | "arma" | "datos" | "otro";
  priceLamports: number;
  stock: number;
  isIllegal: boolean;
  dropZone: string;
}

export interface ProductChanges {
  description: string;
  priceLamports: number;
  stock: number;
  active: boolean;
  dropZone: string;
}

export interface IRegistrationService {
  register(username: string): Promise<void>;
}

export interface IMemorialRepository {
  list(): Promise<MemorialView[]>;
}

export interface IAccountRemoval {
  deleteOwn(username: string): Promise<{ aMemorial: boolean }>;
}

export interface IFederation {
  adminWallet(): Promise<PublicKey>;
  listUsers(): Promise<UsuarioResumen[]>;
  eliminar(username: string): Promise<void>;
}