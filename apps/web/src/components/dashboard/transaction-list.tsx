import { Card, CardHeader } from "@/components/ui/card";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRupiah, formatDate } from "@/lib/utils";
import type { TransactionItem } from "@/lib/api";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react";

type TransactionListProps = {
  transactions: TransactionItem[];
  isLoading?: boolean;
};

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader title="📝 Transaksi Terbaru" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="mb-3 h-14 w-full" />
        ))}
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <EmptyState
          icon="📝"
          title="Belum ada transaksi"
          description="Mulai catat transaksi via chat bot atau form manual."
        />
      </Card>
    );
  }

  const typeConfig = {
    income: {
      icon: <ArrowUpRight className="h-4 w-4 text-emerald-400" />,
      bg: "bg-emerald-950/30",
      text: "text-emerald-400",
      sign: "+",
    },
    expense: {
      icon: <ArrowDownRight className="h-4 w-4 text-red-400" />,
      bg: "bg-red-950/30",
      text: "text-red-400",
      sign: "-",
    },
    transfer: {
      icon: <ArrowLeftRight className="h-4 w-4 text-blue-400" />,
      bg: "bg-blue-950/30",
      text: "text-blue-400",
      sign: "↔",
    },
  };

  return (
    <Card>
      <CardHeader
        title="📝 Transaksi Terbaru"
        subtitle={`${transactions.length} transaksi terakhir`}
      />

      <div className="space-y-1">
        {transactions.map((tx) => {
          const config = typeConfig[tx.type];
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-zinc-800/30"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${config.bg}`}>
                  {config.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {tx.categoryIcon && (
                      <span className="mr-1.5">{tx.categoryIcon}</span>
                    )}
                    {tx.description}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                    <span>{formatDate(tx.date)}</span>
                    {tx.walletName && (
                      <>
                        <span>•</span>
                        <span>{tx.walletName}</span>
                      </>
                    )}
                    {tx.categoryName && (
                      <>
                        <span>•</span>
                        <span>{tx.categoryName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${config.text}`}>
                  {config.sign} {formatRupiah(tx.amount)}
                </p>
                <span className="text-xs capitalize text-zinc-600">
                  {tx.type === "income"
                    ? "Masuk"
                    : tx.type === "expense"
                      ? "Keluar"
                      : "Transfer"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}