import { NextResponse } from "next/server";

export async function POST() {
  const resp = NextResponse.json({ success: true });
  resp.cookies.set("backendToken", "", { path: "/", maxAge: 0 });
  return resp;
}
