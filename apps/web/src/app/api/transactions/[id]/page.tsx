import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { formatRupiah, formatDate } from "@/lib/utils";
import { prisma } from "@zendompi/database";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  // Fetch langsung dari Prisma
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
    include: {
      category: {
        select: { id: true, name: true, icon: true },
      },
      ledgerEntries: {
        include: {
          wallet: {
            select: { id: true, name: true, type: true, currency: true },
          },
        },
        orderBy: { accountType: "asc" },
      },
    },
  });

  if (!transaction) {
    redirect("/transactions");
  }

  // Format
  const tx = {
    id: transaction.id,
    type: transaction.type,
    description: transaction.description,
    amount: transaction.totalAmount.toNumber(),
    date: transaction.transactionDate.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
    category: transaction.category
      ? {
          id: transaction.category.id,
          name: transaction.category.name,
          icon: transaction.category.icon,
        }
      : null,
    entries: transaction.ledgerEntries.map((entry) => ({
      id: entry.id,
      walletName: entry.wallet.name,
      walletType: entry.wallet.type,
      walletCurrency: entry.wallet.currency,
      accountType: entry.accountType,
      amount: entry.amount.toNumber(),
      label:
        entry.accountType === "debit"
          ? `Masuk ke ${entry.wallet.name}`
          : `Keluar dari ${entry.wallet.name}`,
    })),
  };

  const typeConfig = {
    income: {
      icon: <ArrowUpRight className="h-6 w-6" />,
      bg: "bg-emerald-950/30 border-emerald-800/30",
      text: "text-emerald-400",
      label: "Pemasukan",
    },
    expense: {
      icon: <ArrowDownRight className="h-6 w-6" />,
      bg: "bg-red-950/30 border-red-800/30",
      text: "text-red-400",
      label: "Pengeluaran",
    },
    transfer: {
      icon: <ArrowLeftRight className="h-6 w-6" />,
      bg: "bg-blue-950/30 border-blue-800/30",
      text: "text-blue-400",
      label: "Transfer",
    },
  };

  const config = typeConfig[tx.type as keyof typeof typeConfig];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Link
          href="/transactions"
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-zinc-100">Detail Transaksi</h1>
      </header>

      {/* Main Card */}
      <Card className={`border ${config.bg}`}>
        <div className="mb-4 flex items-center gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-xl ${config.bg} ${config.text}`}
          >
            {config.icon}
          </div>
          <div>
            <span className={`text-xs font-medium uppercase ${config.text}`}>
              {config.label}
            </span>
            <p className={`text-2xl font-bold ${config.text}`}>
              {formatRupiah(tx.amount)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-zinc-500">Deskripsi</span>
            <span className="text-sm text-zinc-200">{tx.description}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-zinc-500">Tanggal</span>
            <span className="text-sm text-zinc-200">{formatDate(tx.date)}</span>
          </div>
          {tx.category && (
            <div className="flex justify-between">
              <span className="text-sm text-zinc-500">Kategori</span>
              <span className="text-sm text-zinc-200">
                {tx.category.icon} {tx.category.name}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-zinc-500">ID</span>
            <code className="text-xs text-zinc-600">{tx.id}</code>
          </div>
        </div>
      </Card>

      {/* Ledger Entries */}
      <Card>
        <CardHeader title="📒 Detail Pergerakan Dana" />

        <div className="space-y-2">
          {tx.entries.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                entry.accountType === "debit"
                  ? "border-emerald-800/20 bg-emerald-950/20"
                  : "border-red-800/20 bg-red-950/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${
                    entry.accountType === "debit"
                      ? "bg-emerald-950/50 text-emerald-400"
                      : "bg-red-950/50 text-red-400"
                  }`}
                >
                  {entry.accountType === "debit" ? "📥" : "📤"}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {entry.label}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {entry.walletName} • {entry.walletType}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${
                  entry.accountType === "debit"
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {entry.accountType === "debit" ? "+" : "-"}{" "}
                {formatRupiah(entry.amount)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}