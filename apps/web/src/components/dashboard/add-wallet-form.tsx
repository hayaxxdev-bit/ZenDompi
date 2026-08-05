"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Plus, X, Loader2, Wallet } from "lucide-react";

type AddWalletFormProps = {
  onWalletAdded?: () => void;
};

const WALLET_TYPES = [
  { value: "cash", label: "💵 Cash", description: "Uang tunai" },
  { value: "bank", label: "🏦 Bank", description: "Rekening bank" },
  { value: "e-wallet", label: "📱 E-Wallet", description: "GoPay, OVO, DANA, dll" },
];

export function AddWalletForm({ onWalletAdded }: AddWalletFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("cash");
  const [initialBalance, setInitialBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          initialBalance: parseFloat(initialBalance) || 0,
        }),
      });

      if (res.ok) {
        setIsOpen(false);
        setName("");
        setType("cash");
        setInitialBalance("");
        onWalletAdded?.();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal menambah wallet");
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 p-4 text-sm text-zinc-500 transition-colors hover:border-emerald-600 hover:text-emerald-400"
      >
        <Plus className="h-4 w-4" />
        Tambah Dompet Baru
      </button>
    );
  }

  return (
    <Card className="border-emerald-800/30">
      <CardHeader
        title="💳 Dompet Baru"
        action={
          <button
            onClick={() => {
              setIsOpen(false);
              setError("");
            }}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Wallet Name */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Nama Dompet
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: BCA Tahapan, GoPay"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>

        {/* Wallet Type */}
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            Tipe Dompet
          </label>
          <div className="grid gap-2">
            {WALLET_TYPES.map((wt) => (
              <button
                key={wt.value}
                type="button"
                onClick={() => setType(wt.value)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  type === wt.value
                    ? "border-emerald-600 bg-emerald-950/30"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                }`}
              >
                <span className="text-lg">{wt.label.split(" ")[0]}</span>
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {wt.label.split(" ").slice(1).join(" ")}
                  </p>
                  <p className="text-xs text-zinc-500">{wt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Initial Balance */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Saldo Awal (Rp)
          </label>
          <input
            type="number"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-950/50 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="h-4 w-4" />
          )}
          {isLoading ? "Menyimpan..." : "Simpan Dompet"}
        </button>
      </form>
    </Card>
  );
}