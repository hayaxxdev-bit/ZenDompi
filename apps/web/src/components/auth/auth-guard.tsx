"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { LoadingScreen } from "@/components/ui/loading-screen";

type AuthGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * Auth Guard Component
 * 
 * Memastikan user sudah login sebelum menampilkan children.
 * Jika belum login, redirect ke /login.
 * Menampilkan loading screen saat mengecek session.
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [status, router, pathname]);

  // Loading state
  if (status === "loading") {
    return fallback || <LoadingScreen message="Mengecek sesi..." />;
  }

  // Not authenticated - akan redirect (tapi tampilkan fallback dulu)
  if (status === "unauthenticated") {
    return (
      fallback || (
        <LoadingScreen message="Mengarahkan ke halaman login..." />
      )
    );
  }

  // Authenticated
  return <>{children}</>;
}

/**
 * HOC untuk proteksi halaman
 * 
 * Usage:
 * export default withAuth(MyPage);
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard fallback={fallback}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}