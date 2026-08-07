import { prisma } from "../client";
import { getNetWorth } from "../balance";
import { listWallets } from "../wallet";

export async function getDashboard(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [netWorth, wallets, recentTransactions, monthlyStats, expenseByCategory] =
    await Promise.all([
      getNetWorth(userId),

      listWallets(userId),

      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 5,
        include: {
          wallet: { select: { name: true } },
          category: { select: { name: true, icon: true } },
        },
      }),

      prisma.transaction.groupBy({
        by: ["type"],
        where: {
          userId,
          type: { in: ["INCOME", "EXPENSE"] },
          date: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),

      prisma.transaction.findMany({
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: startOfMonth },
        },
        include: { category: { select: { name: true, icon: true } } },
      }),
    ]);

  const totalIncome =
    monthlyStats.find((s) => s.type === "INCOME")?._sum.amount?.toNumber() ?? 0;
  const totalExpense =
    monthlyStats.find((s) => s.type === "EXPENSE")?._sum.amount?.toNumber() ?? 0;

  // Group expense by category
  const categoryMap = new Map<string, { name: string; icon: string; amount: number }>();

  for (const tx of expenseByCategory) {
    const name = tx.category?.name || "Lainnya";
    const icon = tx.category?.icon || "📌";
    const amount = tx.amount.toNumber();

    const existing = categoryMap.get(name);
    if (existing) {
      existing.amount += amount;
    } else {
      categoryMap.set(name, { name, icon, amount });
    }
  }

  const expenses = Array.from(categoryMap.values())
    .map((c) => ({
      ...c,
      percentage: totalExpense > 0 ? (c.amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    netWorth,
    totalIncome,
    totalExpense,
    wallets,
    recentTransactions: recentTransactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      description: tx.description,
      amount: tx.amount.toNumber(),
      date: tx.date.toISOString(),
      walletName: tx.wallet.name,
      category: tx.category,
    })),
    expenseByCategory: expenses,
    month: startOfMonth.toISOString(),
  };
}