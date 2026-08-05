import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";
import { WalletSummary } from "@/components/profile/wallet-summary";
import { BotConnectionStatus } from "@/components/profile/bot-connection-status";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-zinc-100">👤 Profil Saya</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Kelola informasi akun dan koneksi bot
        </p>
      </header>

      {/* Profile Form */}
      <ProfileForm user={session.user} />

      {/* Bot Connection Status */}
      <BotConnectionStatus userId={session.user.id} />

      {/* Wallet Summary */}
      <WalletSummary userId={session.user.id} />
    </div>
  );
}