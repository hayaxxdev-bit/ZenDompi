import { prisma } from "@zendompi/database";
import { Card, CardHeader } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type BotConnectionStatusProps = {
  userId: string;
};

export async function BotConnectionStatus({
  userId,
}: BotConnectionStatusProps) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      phoneNumber: true,
      telegramId: true,
    },
  });

  return (
    <Card>
      <CardHeader
        title="🤖 Koneksi Bot"
        subtitle="Hubungkan akun dengan WhatsApp & Telegram untuk mencatat transaksi via chat"
      />

      <div className="space-y-3">
        {/* WhatsApp Status */}
        <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">💬</span>
            <div>
              <p className="text-sm font-medium text-zinc-200">WhatsApp</p>
              <p className="text-xs text-zinc-500">
                {user?.phoneNumber
                  ? `Terhubung: ${user.phoneNumber}`
                  : "Belum terhubung"}
              </p>
            </div>
          </div>
          {user?.phoneNumber ? (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Aktif
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <AlertCircle className="h-3.5 w-3.5" />
              Belum setup
            </span>
          )}
        </div>

        {/* Telegram Status */}
        <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">📬</span>
            <div>
              <p className="text-sm font-medium text-zinc-200">Telegram</p>
              <p className="text-xs text-zinc-500">
                {user?.telegramId
                  ? `Terhubung: ID ${user.telegramId.toString()}`
                  : "Belum terhubung"}
              </p>
            </div>
          </div>
          {user?.telegramId ? (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Aktif
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <XCircle className="h-3.5 w-3.5" />
              Belum setup
            </span>
          )}
        </div>

        {/* Bot Info */}
        <div className="mt-3 rounded-lg border border-emerald-800/30 bg-emerald-950/20 p-3">
          <p className="text-xs text-emerald-400">
            💡 <strong>Cara menghubungkan bot:</strong>
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-zinc-400">
            <li>
              • <strong>WhatsApp:</strong> Simpan nomor bot lalu kirim pesan
              &quot;Halo&quot;
            </li>
            <li>
              • <strong>Telegram:</strong> Cari @ZenDompiBot lalu kirim
              /start
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}