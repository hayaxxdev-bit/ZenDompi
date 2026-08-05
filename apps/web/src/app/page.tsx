import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { WalletList } from "@/components/dashboard/wallet-list";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { AddTransactionForm } from "@/components/dashboard/add-transaction-form";
import { LogOutButton } from "@/components/dashboard/logout-button";

async function getDashboardData(userId: string) {
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  
  const res = await fetch(
    `${baseUrl}/api/dashboard?userId=${userId}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return res.json();
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            🏦 ZenDompi
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Selamat datang, {session.user.name || "User"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 sm:inline">
            {session.user.phoneNumber && `📱 ${(session.user as any).phoneNumber}`}
          </span>
          <LogOutButton />
        </div>
      </header>

      {/* Summary Cards */}
      <SummaryCards
        netWorth={data.netWorth}
        totalIncome={data.totalIncome}
        totalExpense={data.totalExpense}
      />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ExpenseChart data={data.expenseByCategory} />
          <TransactionList transactions={data.recentTransactions} />
        </div>
        <div className="space-y-6">
          <WalletList wallets={data.wallets} />
          <AddTransactionForm
            wallets={data.wallets.map((w: any) => ({
              id: w.id,
              name: w.name,
            }))}
          />
        </div>
      </div>
    </div>
  );
}