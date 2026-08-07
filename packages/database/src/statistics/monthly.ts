import { prisma } from "../client";

export type MonthlyStatsInput = {
  userId: string;
  year: number;
  month: number; // 1-12
};

export async function getMonthlyStats(input: MonthlyStatsInput) {
  const { userId, year, month } = input;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const stats = await prisma.transaction.groupBy({
    by: ["type"],
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
    _count: true,
  });

  const income = stats.find((s) => s.type === "INCOME")?._sum.amount?.toNumber() ?? 0;
  const expense = stats.find((s) => s.type === "EXPENSE")?._sum.amount?.toNumber() ?? 0;
  const transfer = stats.find((s) => s.type === "TRANSFER")?._sum.amount?.toNumber() ?? 0;
  const totalTransactions = stats.reduce((sum, s) => sum + s._count, 0);

  return {
    period: { year, month },
    income,
    expense,
    transfer,
    netCashflow: income - expense,
    totalTransactions,
  };
}