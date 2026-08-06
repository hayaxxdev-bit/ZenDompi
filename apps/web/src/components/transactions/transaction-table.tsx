"use client";

import { useRouter } from "next/navigation";
import { formatRupiah, formatDate } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

type Transaction = {
  id: string;
  type: "income" | "expense" | "transfer";
  description: string;
  amount: number;
  date: string;
  category: { id: string; name: string; icon: string } | null;
  wallets: string;
};

type TransactionTableProps = {
  transactions: Transaction[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
  onPageChange?: (page: number) => void;
};

const typeConfig = {
  income: {
    icon: <ArrowUpRight className="h-4 w-4" />,
    bg: "bg-emerald-950/30 border-emerald-800/30",
    text: "text-emerald-400",
    sign: "+",
  },
  expense: {
    icon: <ArrowDownRight className="h-4 w-4" />,
    bg: "bg-red-950/30 border-red-800/30",
    text: "text-red-400",
    sign: "-",
  },
  transfer: {
    icon: <ArrowLeftRight className="h-4 w-4" />,
    bg: "bg-blue-950/30 border-blue-800/30",
    text: "text-blue-400",
    sign: "↔",
  },
};

export function TransactionTable({
  transactions,
  isLoading,
  pagination,
  onPageChange,
}: TransactionTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="📝"
        title="Belum ada transaksi"
        description="Mulai catat transaksi kamu via chat bot atau form manual."
      />
    );
  }

  return (
    <div>
      {/* Table */}
      <div className="space-y-1">
        {transactions.map((tx) => {
          const config = typeConfig[tx.type];
          return (
            <button
              key={tx.id}
              onClick={() => router.push(`/transactions/${tx.id}`)}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors hover:bg-zinc-800/50 ${config.bg}`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.bg} ${config.text}`}>
                  {config.icon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    {tx.category?.icon && (
                      <span className="text-sm">{tx.category.icon}</span>
                    )}
                    <p className="text-sm font-medium text-zinc-200 line-clamp-1">
                      {tx.description}
                    </p>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                    <span>{formatDate(tx.date)}</span>
                    {tx.wallets && (
                      <>
                        <span>•</span>
                        <span>{tx.wallets}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className={`text-sm font-semibold ${config.text}`}>
                    {config.sign} {formatRupiah(tx.amount)}
                  </p>
                  <span className="text-xs capitalize text-zinc-600">
                    {tx.type === "income" ? "Masuk" : tx.type === "expense" ? "Keluar" : "Transfer"}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Halaman {pagination.page} dari {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Prev
            </button>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.hasMore}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}