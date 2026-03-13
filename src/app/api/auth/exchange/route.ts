import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ success: false, error: { code: "NO_SECRET", message: "NEXTAUTH_SECRET missing" } }, { status: 500 });
    }

    // Read the decoded NextAuth token from cookies.
    // Important: depending on NextAuth version/config, the cookie token may be JWE-encrypted (not verifiable by the Go API).
    // To keep the backend contract stable, we issue our own short-lived HS256 JWS containing the fields the API expects.
    const token = await getToken({ req, secret });
    if (!token || !token.sub) {
      return NextResponse.json({ success: false, error: { code: "NO_NEXTAUTH", message: "Not authenticated" } }, { status: 401 });
    }

    const nextAuthJws = await new SignJWT({
      // The Go API expects "name" and "picture" claims.
      name: (token as any).name ?? (token as any).username ?? "",
      picture: (token as any).picture ?? (token as any).avatar ?? null,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(token.sub)
      .setIssuedAt()
      // Keep this short; the API will mint its own token anyway.
      .setExpirationTime("10m")
      .sign(new TextEncoder().encode(secret));

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";
    const res = await fetch(`${apiUrl}/auth/discord`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: nextAuthJws }),
    });

    const text = await res.text();
    let json: any;
    try { json = JSON.parse(text); } catch { json = {}; }

    if (!res.ok) {
      const message = json?.error?.message || `Exchange failed (${res.status})`;
      return NextResponse.json({ success: false, error: { code: "EXCHANGE_FAILED", message } }, { status: 502 });
    }

    const backendToken = json?.data?.token ?? json?.token;
    if (!backendToken) {
      return NextResponse.json({ success: false, error: { code: "NO_BACKEND_TOKEN", message: "No token in response" } }, { status: 502 });
    }

    const resp = NextResponse.json({ success: true });
    resp.cookies.set("backendToken", backendToken, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });
    return resp;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: "INTERNAL", message: err?.message ?? "Unexpected error" } }, { status: 500 });
  }
}
