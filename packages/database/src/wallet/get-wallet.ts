import { prisma } from "../client";

export async function getWallet(walletId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, userId },
  });

  if (!wallet) return null;

  return {
    ...wallet,
    balance: wallet.balance.toNumber(),
  };
}