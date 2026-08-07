import { prisma } from "../client";

/**
 * Net worth = total saldo semua wallet aktif
 */
export async function getNetWorth(userId: string): Promise<number> {
  const result = await prisma.wallet.aggregate({
    where: {
      userId,
      isArchived: false,
    },
    _sum: { balance: true },
  });

  return result._sum.balance?.toNumber() ?? 0;
}