import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("[exchange] NEXTAUTH_SECRET is not set");
      return NextResponse.json({ success: false, error: { code: "NO_SECRET", message: "NEXTAUTH_SECRET missing" } }, { status: 500 });
    }

    // Read the decoded NextAuth token from cookies.
    // Important: depending on NextAuth version/config, the cookie token may be JWE-encrypted (not verifiable by the Go API).
    // To keep the backend contract stable, we issue our own short-lived HS256 JWS containing the fields the API expects.
    const token = await getToken({ req, secret });
    if (!token || !token.sub) {
      console.error("[exchange] No NextAuth token found");
      return NextResponse.json({ success: false, error: { code: "NO_NEXTAUTH", message: "Not authenticated" } }, { status: 401 });
    }

    console.log("[exchange] Creating JWT for Discord user:", token.sub);

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
    console.log("[exchange] Calling backend:", `${apiUrl}/auth/discord`);

    const res = await fetch(`${apiUrl}/auth/discord`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: nextAuthJws }),
    });

    const text = await res.text();
    console.log("[exchange] Backend response status:", res.status);

    let json: any;
    try { json = JSON.parse(text); } catch {
      console.error("[exchange] Failed to parse backend response:", text.substring(0, 200));
      json = {};
    }

    if (!res.ok) {
      const message = json?.error?.message || `Exchange failed (${res.status})`;
      console.error("[exchange] Backend returned error:", message);
      return NextResponse.json({ success: false, error: { code: "EXCHANGE_FAILED", message } }, { status: 502 });
    }

    const backendToken = json?.data?.token ?? json?.token;
    if (!backendToken) {
      console.error("[exchange] No token in backend response:", JSON.stringify(json).substring(0, 200));
      return NextResponse.json({ success: false, error: { code: "NO_BACKEND_TOKEN", message: "No token in response" } }, { status: 502 });
    }

    console.log("[exchange] Successfully obtained backend token, setting cookie");

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
    console.error("[exchange] Unexpected error:", err);
    return NextResponse.json({ success: false, error: { code: "INTERNAL", message: err?.message ?? "Unexpected error" } }, { status: 500 });
  }
}
