"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function LogOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:border-red-800 hover:bg-red-950/30 hover:text-red-400 disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">
        {isLoading ? "Keluar..." : "Keluar"}
      </span>
    </button>
  );
}