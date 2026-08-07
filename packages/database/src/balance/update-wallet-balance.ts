import { prisma } from "../client";

/**
 * Update saldo wallet secara atomik
 * Positif = tambah, negatif = kurang
 */
export async function updateWalletBalance(
  walletId: string,
  amount: number
) {
  return prisma.wallet.update({
    where: { id: walletId },
    data: {
      balance: {
        increment: amount,
      },
    },
  });
}