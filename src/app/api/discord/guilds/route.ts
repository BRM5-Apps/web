import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Discord's ADMINISTRATOR permission bit
const ADMINISTRATOR = BigInt(0x8);

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.discordAccessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${token.discordAccessToken}`,
    },
    // Do not cache — guild membership changes frequently
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Discord guilds fetch failed:", res.status, text);
    return NextResponse.json(
      { error: "Failed to fetch guilds from Discord" },
      { status: res.status }
    );
  }

  const guilds: DiscordGuild[] = await res.json();

  // Filter to guilds where the user has the ADMINISTRATOR permission (bit 0x8)
  const adminGuilds = guilds.filter(
    (g) => (BigInt(g.permissions) & ADMINISTRATOR) === ADMINISTRATOR
  );

  return NextResponse.json(adminGuilds);
}
