"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";

type ProfileFormProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
};

export function ProfileForm({ user }: ProfileFormProps) {
  const { update } = useSession();
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (res.ok) {
        await update({ name, email });
        setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      } else {
        const data = await res.json();
        setMessage({
          type: "error",
          text: data.error || "Gagal memperbarui profil",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan. Coba lagi nanti.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Informasi Akun"
        subtitle="Data ini akan ditampilkan di profil kamu"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Nama
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kamu"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Email (Opsional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Message */}
        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${
              message.type === "success"
                ? "bg-emerald-950/50 text-emerald-400"
                : "bg-red-950/50 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </Card>
  );
}