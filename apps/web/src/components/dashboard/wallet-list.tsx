"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRupiah } from "@/lib/utils";
import type { WalletBalance } from "@/lib/api";
import { AddWalletForm } from "./add-wallet-form";
import { Plus, X } from "lucide-react";

type WalletListProps = {
  wallets: WalletBalance[];
  isLoading?: boolean;
};

export function WalletList({
  wallets,
  isLoading,
}: WalletListProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleWalletAdded = () => {
    setShowAddForm(false);

    // sementara refresh penuh
    window.location.reload();

    // nanti diganti revalidatePath / router.refresh()
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="💳 Dompet Saya" />

        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="mb-3 flex items-center justify-between"
          >
            <CardSkeleton />
          </div>
        ))}
      </Card>
    );
  }

  const typeColors: Record<string, string> = {
    bank: "border-l-blue-500 bg-blue-950/20",
    "e-wallet": "border-l-purple-500 bg-purple-950/20",
    cash: "border-l-amber-500 bg-amber-950/20",
  };

  const typeIcons: Record<string, string> = {
    bank: "🏦",
    "e-wallet": "📱",
    cash: "💵",
  };

  if (wallets.length === 0) {
    return (
      <Card>
        <EmptyState
          icon="💳"
          title="Belum ada dompet"
          description="Tambahkan dompet pertama kamu untuk mulai mencatat keuangan."
          action={
            !showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
              >
                + Tambah Dompet
              </button>
            ) : undefined
          }
        />

        {showAddForm && (
          <div className="mt-4 space-y-3 border-t border-zinc-800/50 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">
                Tambah Dompet Baru
              </span>

              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <AddWalletForm
              onWalletAdded={handleWalletAdded}
            />
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="💳 Dompet Saya"
        subtitle={`${wallets.length} dompet aktif`}
        action={
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            title={
              showAddForm
                ? "Tutup"
                : "Tambah Dompet"
            }
          >
            {showAddForm ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        }
      />

      <div className="space-y-2">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className={`rounded-lg border-l-2 p-3 ${
              typeColors[wallet.type] ??
              "border-l-zinc-600 bg-zinc-800/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {typeIcons[wallet.type] ?? "💳"}
                </span>

                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {wallet.name}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {wallet.type}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-zinc-100">
                  {formatRupiah(wallet.balance)}
                </p>

                <div className="mt-1 h-1 w-full rounded-full bg-zinc-800">
                  <div
                    className="h-1 rounded-full bg-emerald-500"
                    style={{
                      width: `${wallet.percentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="mt-4 border-t border-zinc-800/50 pt-4">
          <AddWalletForm
            onWalletAdded={handleWalletAdded}
          />
        </div>
      )}
    </Card>
  );
}