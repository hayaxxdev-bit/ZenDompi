import { prisma, getWalletBalance } from "@zendompi/database";
import { Card, CardHeader } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";

type WalletSummaryProps = {
  userId: string;
};

export async function WalletSummary({ userId }: WalletSummaryProps) {
  const wallets = await prisma.wallet.findMany({
    where: { userId, isArchived: false },
    orderBy: { createdAt: "asc" },
  });

  const walletsWithBalance = await Promise.all(
    wallets.map(async (wallet) => ({
      ...wallet,
      balance: await getWalletBalance(wallet.id),
    }))
  );

  const totalBalance = walletsWithBalance.reduce(
    (sum, w) => sum + w.balance,
    0
  );

  const typeIcons: Record<string, string> = {
    bank: "🏦",
    "e-wallet": "📱",
    cash: "💵",
  };

  return (
    <Card>
      <CardHeader
        title="💳 Ringkasan Dompet"
        subtitle={`${wallets.length} dompet aktif`}
      />

      {walletsWithBalance.length === 0 ? (
        <p className="py-4 text-center text-sm text-zinc-500">
          Belum ada dompet. Tambahkan dompet pertama kamu!
        </p>
      ) : (
        <div className="space-y-2">
          {walletsWithBalance.map((wallet) => (
            <div
              key={wallet.id}
              className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-3"
            >
              <div className="flex items-center gap-2">
                <span>{typeIcons[wallet.type] || "💳"}</span>
                <span className="text-sm text-zinc-300">{wallet.name}</span>
              </div>
              <span
                className={`text-sm font-medium ${
                  wallet.balance >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {formatRupiah(wallet.balance)}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
            <span className="text-sm font-semibold text-zinc-200">
              Total Saldo
            </span>
            <span className="text-sm font-bold text-emerald-400">
              {formatRupiah(totalBalance)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}