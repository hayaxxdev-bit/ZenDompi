"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

type AddTransactionFormProps = {
  wallets: { id: string; name: string }[];
};

export function AddTransactionForm({ wallets }: AddTransactionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"expense" | "income" | "transfer">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [fromWallet, setFromWallet] = useState("");
  const [toWallet, setToWallet] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement create transaction via API
    console.log({ type, amount, description, fromWallet, toWallet });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 p-4 text-sm text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
      >
        <Plus className="h-4 w-4" />
        Tambah Transaksi Manual
      </button>
    );
  }

  return (
    <Card className="border-emerald-800/30">
      <CardHeader
        title="➕ Transaksi Baru"
        action={
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector */}
        <div className="flex gap-2">
          {(["expense", "income", "transfer"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors",
                type === t
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              )}
            >
              {t === "expense" ? "📤 Keluar" : t === "income" ? "📥 Masuk" : "🔄 Transfer"}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Jumlah</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50000"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Deskripsi</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Makan siang di warteg"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>

        {/* Wallet Selection */}
        <div className="grid gap-3 sm:grid-cols-2">
          {(type === "expense" || type === "transfer") && (
            <div>
              <label className="mb-1 block text-xs text-zinc-400">
                {type === "transfer" ? "Dari" : "Dompet"}
              </label>
              <select
                value={fromWallet}
                onChange={(e) => setFromWallet(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
                required
              >
                <option value="">Pilih dompet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(type === "income" || type === "transfer") && (
            <div>
              <label className="mb-1 block text-xs text-zinc-400">
                {type === "transfer" ? "Ke" : "Dompet"}
              </label>
              <select
                value={toWallet}
                onChange={(e) => setToWallet(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
                required
              >
                <option value="">Pilih dompet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 active:bg-emerald-700"
        >
          Simpan Transaksi
        </button>
      </form>
    </Card>
  );
}