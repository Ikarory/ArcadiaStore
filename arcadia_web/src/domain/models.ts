import { PublicKey } from "@solana/web3.js";

export interface ProfileView {
  address: PublicKey;
  username: string;
  wallet: PublicKey;
}

export interface ProductView {
  address: PublicKey;
  id: number;
  seller: PublicKey;
  name: string;
  description: string;
  imageUri: string;
  category: string;
  priceLamports: number;
  stock: number;
  isIllegal: boolean;
  dropZone: string;
  active: boolean;
}

export interface TicketView {
  id: number;
  buyer: PublicKey;
  product: PublicKey;
  quantity: number;
  totalLamports: number;
  isIllegal: boolean;
  notice: string;
}

export interface MemorialView {
  username: string;
  deletedAt: number; // segundos unix
}

export interface UsuarioResumen {
  username: string;
  wallet: PublicKey;
  productos: number;
  ilegales: number;
}