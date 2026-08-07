import { getWalletBalance } from "./get-wallet-balance";

export async function hasSufficientBalance(
  walletId: string,
  amount: number
): Promise<boolean> {
  const balance = await getWalletBalance(walletId);
  return balance >= amount;
}