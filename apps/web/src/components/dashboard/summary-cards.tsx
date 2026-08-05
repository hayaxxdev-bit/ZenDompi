import { Card } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { formatRupiah, formatCompact } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

type SummaryCardsProps = {
  netWorth: number;
  totalIncome: number;
  totalExpense: number;
  isLoading?: boolean;
};

export function SummaryCards({
  netWorth,
  totalIncome,
  totalExpense,
  isLoading,
}: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Net Worth */}
      <Card className="relative overflow-hidden border-emerald-800/50 bg-emerald-950/30">
        <div className="absolute right-3 top-3 opacity-20">
          <Wallet className="h-12 w-12 text-emerald-400" />
        </div>
        <p className="text-xs font-medium text-emerald-400">💰 Kekayaan Bersih</p>
        <p className="mt-2 text-2xl font-bold text-emerald-300">
          {formatCompact(netWorth)}
        </p>
        <p className="mt-1 text-xs text-emerald-600">{formatRupiah(netWorth)}</p>
      </Card>

      {/* Total Income */}
      <Card className="relative overflow-hidden border-blue-800/50 bg-blue-950/30">
        <div className="absolute right-3 top-3 opacity-20">
          <TrendingUp className="h-12 w-12 text-blue-400" />
        </div>
        <p className="text-xs font-medium text-blue-400">📥 Pemasukan (Bulan Ini)</p>
        <p className="mt-2 text-2xl font-bold text-blue-300">
          {formatCompact(totalIncome)}
        </p>
        <p className="mt-1 text-xs text-blue-600">{formatRupiah(totalIncome)}</p>
      </Card>

      {/* Total Expense */}
      <Card className="relative overflow-hidden border-red-800/50 bg-red-950/30">
        <div className="absolute right-3 top-3 opacity-20">
          <TrendingDown className="h-12 w-12 text-red-400" />
        </div>
        <p className="text-xs font-medium text-red-400">📤 Pengeluaran (Bulan Ini)</p>
        <p className="mt-2 text-2xl font-bold text-red-300">
          {formatCompact(totalExpense)}
        </p>
        <p className="mt-1 text-xs text-red-600">{formatRupiah(totalExpense)}</p>
      </Card>
    </div>
  );
}