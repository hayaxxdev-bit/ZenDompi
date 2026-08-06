"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export function TransactionExport() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set("limit", "1000");
      params.delete("page");

      // Fetch dari API route (ini client-side, jadi aman)
      const res = await fetch(`/api/transactions?${params.toString()}`);

      if (!res.ok) {
        const text = await res.text();
        console.error("Export error response:", text);
        alert("Gagal export: Session expired. Silakan refresh halaman.");
        return;
      }

      const data = await res.json();

      if (!data.data?.length) {
        alert("Tidak ada data untuk di-export.");
        return;
      }

      // Convert to CSV
      const headers = ["Tanggal", "Tipe", "Deskripsi", "Jumlah", "Dompet", "Kategori"];
      const rows = data.data.map((tx: any) => [
        new Date(tx.date).toLocaleDateString("id-ID"),
        tx.type === "income" ? "Masuk" : tx.type === "expense" ? "Keluar" : "Transfer",
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount,
        tx.wallets || "",
        tx.category?.name || "-",
      ]);

      const csv = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");

      // Download
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `zendompi-transactions-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Gagal export. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200 disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Export CSV
    </button>
  );
}