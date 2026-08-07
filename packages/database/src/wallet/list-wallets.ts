import { prisma } from "../client";

export async function listWallets(userId: string, includeArchived = false) {
  const wallets = await prisma.wallet.findMany({
    where: {
      userId,
      ...(includeArchived ? {} : { isArchived: false }),
    },
    orderBy: { createdAt: "asc" },
  });

  const totalBalance = wallets.reduce(
    (sum, w) => sum + w.balance.toNumber(),
    0
  );

  return wallets.map((wallet) => ({
    ...wallet,
    balance: wallet.balance.toNumber(),
    percentage: totalBalance > 0
      ? (wallet.balance.toNumber() / totalBalance) * 100
      : 0,
  }));
}