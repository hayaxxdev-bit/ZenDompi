"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Send,
  ArrowRight,
  Loader2,
  Bot,
  Copy,
  Check,
  RefreshCw,
  MessageCircle,
  QrCode,
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [mode, setMode] = useState<"telegram-id" | "login-code">("login-code");

  // ─── Login Code State ──────────────────────────
  const [sessionId, setSessionId] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const loginCodeRef = useRef(""); // ← SIMPAN DI REF untuk closure
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [loginError, setLoginError] = useState("");

  // ─── Telegram ID State ─────────────────────────
  const [telegramId, setTelegramId] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Cleanup polling saat unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Sync state → ref
  useEffect(() => {
    loginCodeRef.current = loginCode;
  }, [loginCode]);

  // ─── METHOD 1: LOGIN CODE ──────────────────────

  const generateLoginCode = async () => {
    setLoginError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/generate-login-code", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setSessionId(data.sessionId);
        setLoginCode(data.code);
        loginCodeRef.current = data.code; // ← SIMPAN KE REF
        setIsCodeGenerated(true);
        setPollingCount(0);

        // Mulai polling
        startPolling(data.sessionId);
      } else {
        setLoginError(data.error || "Gagal generate kode");
      }
    } catch {
      setLoginError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = (sid: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    let attempts = 0;
    const maxAttempts = 60;

    pollingRef.current = setInterval(async () => {
      attempts++;
      setPollingCount(attempts);

      try {
        const res = await fetch(`/api/auth/verify-login-code?sessionId=${sid}`);
        const data = await res.json();

        if (data.verified && data.telegramId) {
          // Stop polling
          if (pollingRef.current) clearInterval(pollingRef.current);

          const code = loginCodeRef.current;
          console.log("✅ Verified! Auto-login...");

          // redirect: true → NextAuth set cookie + redirect ke /
          await signIn("telegram-otp", {
            telegramId: data.telegramId,
            otp: code,
            redirect: true,
            callbackUrl: "/",
          });
          return;
        }

        if (attempts >= maxAttempts) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setLoginError("Waktu verifikasi habis. Generate kode baru.");
          setIsCodeGenerated(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);
  };
  const copyCode = () => {
    const text = `/login ${loginCode}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // ─── METHOD 2: telegram ID + OTP ──────────────

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!telegramId.trim()) {
      setError("Masukkan Telegram ID kamu");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/request-telegram-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId: telegramId.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message);
        setOtp("");
      } else {
        setError(data.error || "Gagal mengirim OTP");
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
      const result = await signIn("telegram-otp", {
        telegramId: telegramId,
        otp: loginCodeRef.current,
        redirect: false,
      });

      if (result?.ok) {
        router.replace("/");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── RENDER ────────────────────────────────────

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20">
            <Send className="h-7 w-7 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Login ZenDompi</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Hubungkan dengan Telegram
          </p>
        </div>

        {/* Mode Selector */}
        <div className="mb-4 flex rounded-xl bg-zinc-900 p-1">
          <button
            onClick={() => {
              setMode("login-code");
              setError("");
              setLoginError("");
            }}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "login-code"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            📱 Kode Login
          </button>
          <button
            onClick={() => {
              setMode("telegram-id");
              setError("");
              setLoginError("");
            }}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "telegram-id"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            🆔 Telegram ID
          </button>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
          {/* ── Login Code ── */}
          {mode === "login-code" && (
            <div className="space-y-4">
              {!isCodeGenerated ? (
                <>
                  <div className="rounded-lg border border-blue-800/30 bg-blue-950/20 p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-300">
                      <MessageCircle className="h-4 w-4" />
                      Cara Login Cepat:
                    </h3>
                    <ol className="space-y-1.5 text-xs text-blue-300/80">
                      <li>
                        1. Klik <strong>Generate Kode</strong>
                      </li>
                      <li>
                        2. Buka Telegram, cari <strong>@ZenDompiBot</strong>
                      </li>
                      <li>
                        3. Kirim kode ke bot: <code>/login [kode]</code>
                      </li>
                      <li>4. Halaman ini auto-login! 🎉</li>
                    </ol>
                  </div>

                  {loginError && (
                    <div className="rounded-lg bg-red-950/50 p-3 text-sm text-red-400">
                      {loginError}
                    </div>
                  )}

                  <button
                    onClick={generateLoginCode}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <QrCode className="h-4 w-4" />
                        Generate Kode Login
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="rounded-lg border-2 border-emerald-800/50 bg-emerald-950/20 p-5 text-center">
                    <p className="mb-2 text-xs text-emerald-300/80">
                      Kirim ke <strong>@ZenDompiBot</strong>:
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="select-all rounded-lg bg-zinc-800 px-5 py-3 text-2xl font-bold tracking-[0.3em] text-emerald-400">
                        /login {loginCode}
                      </code>
                      <button
                        onClick={copyCode}
                        className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                        title="Copy"
                      >
                        {isCopied ? (
                          <Check className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 py-2 text-sm text-zinc-400">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Menunggu verifikasi
                    {pollingCount > 0 && (
                      <span className="text-xs text-zinc-600">
                        ({pollingCount * 3}s)
                      </span>
                    )}
                  </div>

                  <div className="h-1 w-full rounded-full bg-zinc-800">
                    <div
                      className="h-1 rounded-full bg-blue-500 transition-all duration-300"
                      style={{
                        width: `${Math.min((pollingCount / 60) * 100, 100)}%`,
                      }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      setIsCodeGenerated(false);
                      setLoginCode("");
                      setSessionId("");
                      setPollingCount(0);
                      loginCodeRef.current = "";
                      if (pollingRef.current) clearInterval(pollingRef.current);
                    }}
                    className="w-full rounded-xl border border-zinc-700 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    Batal & Generate Baru
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Telegram ID ── */}
          {mode === "telegram-id" && (
            <>
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Telegram ID Kamu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Bot className="h-5 w-5 text-blue-400" />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={telegramId}
                      onChange={(e) =>
                        setTelegramId(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Contoh: 123456789"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-3 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-500">
                    Buka @ZenDompiBot, kirim /id untuk lihat ID kamu
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-950/50 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="rounded-lg bg-emerald-950/50 p-3 text-sm text-emerald-400">
                    ✅ {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Kirim Kode OTP
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {successMessage && (
                <form
                  onSubmit={handleVerifyOTP}
                  className="mt-4 space-y-4 border-t border-zinc-800 pt-4"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Kode OTP
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="000000"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-center text-2xl tracking-[0.5em] text-zinc-200 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
                      autoFocus
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verifikasi & Masuk"
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          <Link href="/register" className="text-blue-400 hover:text-blue-300">
            Belum punya akun? Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
