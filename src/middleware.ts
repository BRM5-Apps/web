import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/callback", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow NextAuth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const hasBackendCookie = Boolean(request.cookies.get("backendToken")?.value);
  const hasNextAuth = !!token; // NextAuth session (Discord OAuth completed)
  // Both cookies must be present to consider the user fully authenticated.
  // hasNextAuth alone (just after OAuth, before exchange) is NOT enough — the
  // login page needs to run the exchange to set the backendToken cookie.
  const isFullyAuthenticated = hasBackendCookie && hasNextAuth;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // Redirect fully-authenticated users away from login
  if (isFullyAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/select-server", request.url));
  }

  // Protect dashboard routes (legacy /dashboard path)
  if (!hasBackendCookie && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow everything else (public paths, static assets, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/callback"],
};
