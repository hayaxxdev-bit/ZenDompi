"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * SessionProvider wrapper untuk NextAuth
 * 
 * Membungkus seluruh aplikasi agar bisa mengakses
 * session di client components via useSession() hook.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider
      // Refresh session setiap 5 menit
      refetchInterval={5 * 60}
      // Refetch saat window focus
      refetchOnWindowFocus={true}
    >
      {children}
    </NextAuthSessionProvider>
  );
}