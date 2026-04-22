import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register", "/auth/verify-otp", "/auth/forgot-password"];
const PROTECTED_PREFIX = "/dashboard";
const ONBOARDING = "/onboarding";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("flash_token")?.value;
  const stagingId = request.cookies.get("flash_staging_user_id")?.value;
  const isAuthenticated = !!(token || stagingId);

  // Accès aux routes protégées sans auth → login
  if (pathname.startsWith(PROTECTED_PREFIX) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Onboarding sans auth → login
  if (pathname === ONBOARDING && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Déjà connecté → pas besoin de revoir login/register
  if (isAuthenticated && (pathname === "/auth/login" || pathname === "/auth/register")) {
    return NextResponse.redirect(new URL("/dashboard/wallet", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    "/auth/login",
    "/auth/register",
  ],
};
