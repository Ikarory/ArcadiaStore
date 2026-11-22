export function formatoSol(lamports: number): string {
  return `${Number((lamports / 1_000_000_000).toFixed(4))} SOL`;
}