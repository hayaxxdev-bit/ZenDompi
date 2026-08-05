/**
 * API client untuk mengambil data dashboard
 */

export type DashboardData = {
  netWorth: number;
  totalIncome: number;
  totalExpense: number;
  wallets: WalletBalance[];
  recentTransactions: TransactionItem[];
  expenseByCategory: CategoryExpense[];
};

export type WalletBalance = {
  id: string;
  name: string;
  type: string;
  balance: number;
  percentage: number;
};

export type TransactionItem = {
  id: string;
  type: "income" | "expense" | "transfer";
  description: string;
  amount: number;
  walletName?: string;
  categoryName?: string;
  categoryIcon?: string;
  date: string;
};

export type CategoryExpense = {
  name: string;
  icon: string;
  amount: number;
  percentage: number;
};

/**
 * Fetch dashboard data dari API route
 */
export async function fetchDashboardData(
  userId: string
): Promise<DashboardData> {
  const res = await fetch(`/api/dashboard?userId=${userId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return res.json();
}