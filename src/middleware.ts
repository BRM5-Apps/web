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
  const hasNextAuth = !!token;
  // Treat the presence of the backend cookie as the source of truth for gated routes
  const isBackendAuthenticated = hasBackendCookie;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // Redirect authenticated users away from login
  if (isBackendAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect dashboard routes
  if (!isBackendAuthenticated && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination for post-login redirect
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow everything else (public paths, static assets, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/callback"],
};
