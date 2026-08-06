import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { WalletList } from "@/components/dashboard/wallet-list";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { AddTransactionForm } from "@/components/dashboard/add-transaction-form";
import { LogOutButton } from "@/components/dashboard/logout-button";
import Link from "next/link";

async function getDashboardData() {
  const cookieStore = await cookies();

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/dashboard`, {
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  if (!res.ok) {
    console.error(await res.text());
    throw new Error("Failed to fetch dashboard data");
  }

  return res.json();
}
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const data = await getDashboardData();

  console.log("PAGE DATA:", data);

  return (
    <div className="space-y-6">
      {/* Header */}

      <header className="flex items-center justify-between">
        <Link
          href="/transactions"
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          📝 Semua Transaksi
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">🏦 ZenDompi</h1>

          <p className="mt-1 text-sm text-zinc-500">
            Selamat datang, {session.user.name ?? "User"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {session.user.phoneNumber && (
            <span className="hidden rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 sm:inline">
              📱 {session.user.phoneNumber}
            </span>
          )}

          <LogOutButton />
        </div>
      </header>

      {/* Summary */}
      <SummaryCards
        netWorth={data.netWorth}
        totalIncome={data.totalIncome}
        totalExpense={data.totalExpense}
      />

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ExpenseChart data={data.expenseByCategory} />

          <TransactionList transactions={data.recentTransactions} />
        </div>

        <div className="space-y-6">
          <WalletList wallets={data.wallets} />

          <AddTransactionForm
            wallets={data.wallets.map(
              (wallet: { id: string; name: string }) => ({
                id: wallet.id,
                name: wallet.name,
              }),
            )}
          />
        </div>
      </div>
    </div>
  );
}
