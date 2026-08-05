import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Cek session dari cookie NextAuth
  const sessionToken =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  console.log(`🛡️ Middleware: ${pathname} | loggedIn: ${isLoggedIn}`);

  // Public routes
  const publicRoutes = [
    "/login",
    "/register",
    "/api/auth",
    "/api/webhook",
    "/api/health",
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Static files — always allow
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // API protected routes
  const protectedApiRoutes = ["/api/dashboard", "/api/user", "/api/wallets"];
  const isProtectedApi = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedApi && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Redirect ke login kalau belum login dan bukan public route
  if (!isLoggedIn && !isPublicRoute) {
    console.log(`🔒 Redirect to login from: ${pathname}`);
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect ke home kalau sudah login dan di halaman login
  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    console.log(`🏠 Already logged in, redirect to /`);
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};