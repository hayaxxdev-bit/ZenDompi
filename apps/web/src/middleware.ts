import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/api/auth",
  "/api/webhook",
  "/api/health",
];

const PROTECTED_API_ROUTES = [
  "/api/dashboard",
  "/api/user",
  "/api/wallets",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isLoggedIn = !!req.auth;

  console.log(
    `🛡️ ${pathname} | loggedIn=${isLoggedIn} | user=${req.auth?.user?.id ?? "-"}`
  );

  // Static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const isProtectedApi = PROTECTED_API_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // API yang membutuhkan login
  if (isProtectedApi && !isLoggedIn) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // User belum login
  if (!isLoggedIn && !isPublicRoute) {
    console.log(`🔒 Redirect -> /login`);

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // User sudah login
  if (
    isLoggedIn &&
    (pathname === "/login" ||
      pathname === "/register")
  ) {
    console.log("🏠 Already logged in");

    return NextResponse.redirect(
      new URL("/", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};