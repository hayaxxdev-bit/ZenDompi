import { getMonthlyStats } from "./monthly";

export type YearlyStatsInput = {
  userId: string;
  year: number;
};

export async function getYearlyStats(input: YearlyStatsInput) {
  const { userId, year } = input;
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const monthlyData = await Promise.all(
    months.map((month) => getMonthlyStats({ userId, year, month }))
  );

  return {
    year,
    months: monthlyData,
    totals: {
      income: monthlyData.reduce((sum, m) => sum + m.income, 0),
      expense: monthlyData.reduce((sum, m) => sum + m.expense, 0),
      transfer: monthlyData.reduce((sum, m) => sum + m.transfer, 0),
      netCashflow: monthlyData.reduce((sum, m) => sum + m.netCashflow, 0),
      totalTransactions: monthlyData.reduce((sum, m) => sum + m.totalTransactions, 0),
    },
  };
}