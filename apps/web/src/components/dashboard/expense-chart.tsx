"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRupiah } from "@/lib/utils";
import type { CategoryExpense } from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type ExpenseChartProps = {
  data: CategoryExpense[];
  isLoading?: boolean;
};

const COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#d946ef", // fuchsia
  "#ec4899", // pink
];

export function ExpenseChart({ data, isLoading }: ExpenseChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader title="📊 Pengeluaran per Kategori" />
        <Skeleton className="h-[300px] w-full" />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <EmptyState
          icon="📊"
          title="Belum ada pengeluaran"
          description="Catat pengeluaran kamu lewat chat bot atau form manual untuk melihat grafik."
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="📊 Pengeluaran per Kategori"
        subtitle="Bulan ini"
      />

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={2}
              dataKey="amount"
              nameKey="name"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0]!.payload as CategoryExpense;
                return (
                  <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 shadow-xl">
                    <p className="text-sm font-medium text-zinc-200">
                      {data.icon} {data.name}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-100">
                      {formatRupiah(data.amount)}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {data.percentage.toFixed(1)}%
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              formatter={(value: string) => (
                <span className="text-xs text-zinc-400">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* List Kategori */}
      <div className="mt-4 space-y-1.5">
        {data.map((cat, index) => (
          <div
            key={cat.name}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-zinc-800/50"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-zinc-300">
                {cat.icon} {cat.name}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-200">
                {formatRupiah(cat.amount)}
              </p>
              <p className="text-xs text-zinc-500">
                {cat.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}