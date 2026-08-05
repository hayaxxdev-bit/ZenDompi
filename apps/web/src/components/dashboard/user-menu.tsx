"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  Smartphone,
  Wallet,
} from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: "/login" });
  };

  const user = session?.user;
  const phoneNumber = (user as any)?.phoneNumber;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm transition-colors hover:border-zinc-700 hover:bg-zinc-800/80"
      >
        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600/20 text-xs font-bold text-emerald-400">
          {initials}
        </div>

        {/* Name & Phone */}
        <div className="hidden text-left sm:block">
          <p className="text-xs font-medium text-zinc-200">
            {user?.name || "User"}
          </p>
          {phoneNumber && (
            <p className="text-xs text-zinc-500">{phoneNumber}</p>
          )}
        </div>

        <ChevronDown
          className={`hidden h-4 w-4 text-zinc-500 transition-transform sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
          {/* User Info */}
          <div className="border-b border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/20 text-sm font-bold text-emerald-400">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">
                  {user?.name || "User"}
                </p>
                {phoneNumber && (
                  <p className="text-xs text-zinc-500">{phoneNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/profile");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <User className="h-4 w-4 text-zinc-500" />
              Profil Saya
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/settings");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <Settings className="h-4 w-4 text-zinc-500" />
              Pengaturan
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/settings/wallets");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <Wallet className="h-4 w-4 text-zinc-500" />
              Kelola Dompet
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/settings/bot");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <Smartphone className="h-4 w-4 text-zinc-500" />
              Koneksi Bot
            </button>

            <hr className="my-2 border-zinc-800" />

            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}