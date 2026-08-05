"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageCircle, ArrowRight, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPhoneNumber = (input: string) => {
    let cleaned = input.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
    if (!cleaned.startsWith("62")) cleaned = "62" + cleaned;
    return cleaned.slice(0, 15);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (phoneNumber.length < 10) {
      setError("Nomor WhatsApp tidak valid");
      return;
    }

    if (name.length < 2) {
      setError("Nama minimal 2 karakter");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, name }),
      });

      if (res.ok) {
        setStep("otp");
      } else {
        const data = await res.json();
        setError(data.error || "Gagal mendaftar");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Kode OTP harus 6 digit");
      return;
    }

    setIsLoading(true);

    try {
      // Gunakan signIn untuk sekaligus verifikasi OTP dan login
      const result = await signIn("otp", {
        phoneNumber,
        otp,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError("Kode OTP tidak valid atau sudah kadaluarsa");
      } else if (result?.ok) {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan saat verifikasi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/20">
            <span className="text-2xl">🏦</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Daftar ZenDompi</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Mulai catat keuangan dengan mudah
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
          {step === "form" ? (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama kamu"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <MessageCircle className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(formatPhoneNumber(e.target.value))
                    }
                    placeholder="6281234567890"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <p className="mt-1.5 text-xs text-zinc-500">
                  Kode verifikasi akan dikirim via WhatsApp
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-950/50 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Daftar
                  </>
                )}
              </button>

              <p className="text-center text-sm text-zinc-500">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  Login
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-zinc-400">
                  Kode verifikasi dikirim ke
                </p>
                <p className="text-sm font-medium text-zinc-200">
                  {phoneNumber}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Kode Verifikasi
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-center text-2xl tracking-[0.5em] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-950/50 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Verifikasi & Masuk
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setOtp("");
                    setError("");
                  }}
                  className="text-sm text-zinc-500 hover:text-zinc-300"
                >
                  ← Ubah data
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Dengan mendaftar, kamu menyetujui Syarat & Ketentuan ZenDompi
        </p>
      </div>
    </div>
  );
}