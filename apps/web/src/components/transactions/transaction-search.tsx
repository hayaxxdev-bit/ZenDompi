"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function TransactionSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset page
    router.push(`/transactions?${params.toString()}`);
  };

  const handleClear = () => {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("page", "1");
    router.push(`/transactions?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-zinc-500" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari transaksi..."
        className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-10 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <X className="h-4 w-4 text-zinc-500 hover:text-zinc-300" />
        </button>
      )}
    </form>
  );
}