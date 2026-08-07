import { prisma } from "../client";

/**
 * Ambil saldo wallet langsung dari field balance
 * (bukan kalkulasi dari ledger entries seperti schema lama)
 */
export async function getWalletBalance(walletId: string): Promise<number> {
  const wallet = await prisma.wallet.findUniqueOrThrow({
    where: { id: walletId },
    select: { balance: true },
  });

  return wallet.balance.toNumber();
}