import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Discord permission bits
const ADMINISTRATOR = BigInt(0x8);
const MANAGE_GUILD = BigInt(0x20);

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

  // Filter to guilds where the user is owner, has ADMINISTRATOR, or has MANAGE_GUILD
  const adminGuilds = guilds.filter((g) => {
    if (g.owner) return true;
    const perms = BigInt(g.permissions);
    return (perms & ADMINISTRATOR) === ADMINISTRATOR || (perms & MANAGE_GUILD) === MANAGE_GUILD;
  });

  return NextResponse.json(adminGuilds);
}
