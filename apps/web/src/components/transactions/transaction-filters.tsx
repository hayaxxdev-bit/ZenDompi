"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { useState, useEffect } from "react";

type FilterProps = {
  wallets: { id: string; name: string }[];
  categories: { id: string; name: string; icon: string }[];
};

export function TransactionFilters({ wallets, categories }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState(searchParams.get("type") || "");
  const [walletId, setWalletId] = useState(searchParams.get("walletId") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

  const activeFilters = [type, walletId, categoryId, startDate, endDate].filter(Boolean).length;

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (walletId) params.set("walletId", walletId);
    if (categoryId) params.set("categoryId", categoryId);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    params.set("page", "1");
    router.push(`/transactions?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setType("");
    setWalletId("");
    setCategoryId("");
    setStartDate("");
    setEndDate("");
    router.push("/transactions");
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
          activeFilters > 0
            ? "border-emerald-600 bg-emerald-950/30 text-emerald-400"
            : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
        }`}
      >
        <Filter className="h-4 w-4" />
        Filter
        {activeFilters > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
            {activeFilters}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">Filter Transaksi</h3>
            <button onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4 text-zinc-500 hover:text-zinc-300" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Type */}
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Tipe</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Semua</option>
                <option value="income">📥 Pemasukan</option>
                <option value="expense">📤 Pengeluaran</option>
                <option value="transfer">🔄 Transfer</option>
              </select>
            </div>

            {/* Wallet */}
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Dompet</label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Semua</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Semua</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Dari</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Sampai</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={clearFilters}
                className="flex-1 rounded-lg border border-zinc-700 py-2 text-sm text-zinc-400 hover:bg-zinc-800"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}