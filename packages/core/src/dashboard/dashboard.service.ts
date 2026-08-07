import { getDashboard as dbGetDashboard } from "@zendompi/database";

export class DashboardService {
  async getDashboard(userId: string) {
    const data = await dbGetDashboard(userId);

    return {
      netWorth: data.netWorth,
      totalIncome: data.totalIncome,
      totalExpense: data.totalExpense,
      wallets: data.wallets.map((w) => ({
        id: w.id,
        name: w.name,
        balance: w.balance,
        type: w.currency,
        percentage: (w as any).percentage || 0,
      })),
      recentTransactions: data.recentTransactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        description: tx.description,
        amount: tx.amount,
        date: tx.date,
        walletName: (tx as any).walletName || "",
        category: tx.category,
      })),
      expenseByCategory: data.expenseByCategory,
    };
  }
}

export const dashboardService = new DashboardService();