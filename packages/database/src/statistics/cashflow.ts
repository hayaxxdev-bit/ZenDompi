import { prisma } from "../client";

export type CashflowInput = {
  userId: string;
  startDate: Date;
  endDate: Date;
  groupBy?: "day" | "week" | "month";
};

export type CashflowData = {
  period: string;
  income: number;
  expense: number;
  netCashflow: number;
  transactionCount: number;
};

export async function getCashflow(input: CashflowInput): Promise<CashflowData[]> {
  const { userId, startDate, endDate, groupBy = "day" } = input;

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: { in: ["INCOME", "EXPENSE"] },
      date: { gte: startDate, lte: endDate },
    },
    select: {
      type: true,
      amount: true,
      date: true,
    },
    orderBy: { date: "asc" },
  });

  const grouped = new Map<string, CashflowData>();

  for (const tx of transactions) {
    const d = new Date(tx.date);
    let periodKey: string;

    switch (groupBy) {
      case "week": {
        const startOfYear = new Date(d.getFullYear(), 0, 1);
        const weekNum = Math.ceil(
          ((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
        );
        periodKey = `${d.getFullYear()}-W${weekNum}`;
        break;
      }
      case "month":
        periodKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "day":
      default:
        periodKey = d.toISOString().substring(0, 10);
        break;
    }

    if (!grouped.has(periodKey)) {
      grouped.set(periodKey, {
        period: periodKey,
        income: 0,
        expense: 0,
        netCashflow: 0,
        transactionCount: 0,
      });
    }

    const entry = grouped.get(periodKey)!;
    const amount = tx.amount.toNumber();

    if (tx.type === "INCOME") entry.income += amount;
    else entry.expense += amount;

    entry.netCashflow = entry.income - entry.expense;
    entry.transactionCount++;
  }

  return Array.from(grouped.values());
}