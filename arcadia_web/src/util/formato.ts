export function formatoSol(lamports: number): string {
  return `${Number((lamports / 1_000_000_000).toFixed(4))} SOL`;
}
export function acortarWallet(wallet: string): string {
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}