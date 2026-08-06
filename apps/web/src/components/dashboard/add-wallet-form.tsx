"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { Loader2, Plus, Wallet, X } from "lucide-react";

type AddWalletFormProps = {
  onWalletAdded?: () => void;
};

const WALLET_TYPES = [
  {
    value: "cash",
    label: "💵 Cash",
    description: "Uang tunai",
  },
  {
    value: "bank",
    label: "🏦 Bank",
    description: "Rekening Bank",
  },
  {
    value: "e-wallet",
    label: "📱 E-Wallet",
    description: "GoPay, OVO, DANA, ShopeePay",
  },
];

export function AddWalletForm({
  onWalletAdded,
}: AddWalletFormProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState("");

  const [type, setType] = useState("cash");

  const [initialBalance, setInitialBalance] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] = useState("");

  function resetForm() {
    setName("");
    setType("cash");
    setInitialBalance("");
    setError("");
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setError("");

    const walletName = name.trim();

    if (!walletName) {
      setError("Nama dompet wajib diisi.");
      return;
    }

    const balance =
      Number(initialBalance) || 0;

    if (balance < 0) {
      setError(
        "Saldo awal tidak boleh negatif.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        "/api/wallets",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: walletName,
            type,
            initialBalance: balance,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ??
            "Gagal membuat dompet.",
        );
      }

      resetForm();

      setIsOpen(false);

      router.refresh();

      onWalletAdded?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 p-4 text-sm text-zinc-500 transition hover:border-emerald-600 hover:text-emerald-400"
      >
        <Plus className="h-4 w-4" />
        Tambah Dompet Baru
      </button>
    );
  }

  return (
    <Card className="border-emerald-800/30">
      <CardHeader
        title="💳 Tambah Dompet"
        action={
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            Nama Dompet
          </label>

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Contoh: BCA, GoPay"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            Jenis Dompet
          </label>

          <div className="grid gap-2">
            {WALLET_TYPES.map((wallet) => (
              <button
                key={wallet.value}
                type="button"
                onClick={() =>
                  setType(wallet.value)
                }
                className={`rounded-lg border p-3 text-left transition ${
                  wallet.value === type
                    ? "border-emerald-600 bg-emerald-950/30"
                    : "border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <div className="font-medium text-zinc-200">
                  {wallet.label}
                </div>

                <div className="text-xs text-zinc-500">
                  {wallet.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            Saldo Awal
          </label>

          <input
            type="number"
            min={0}
            step="0.01"
            value={initialBalance}
            onChange={(e) =>
              setInitialBalance(
                e.target.value,
              )
            }
            placeholder="0"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-950/40 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={
            isLoading || !name.trim()
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4" />
              Simpan Dompet
            </>
          )}
        </button>
      </form>
    </Card>
  );
}