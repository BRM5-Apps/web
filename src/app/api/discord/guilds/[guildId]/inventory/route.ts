import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import type { DiscordGuildInventory, DiscordGuildChannel, DiscordGuildRole, DiscordGuildUser } from "@/types/discord-inventory";

// Response shape from Go backend cache
interface BackendGuildCache {
  guildId: string;
  roles: Array<{
    id: string;
    name: string;
    color: number;
    position: number;
    icon?: string;
  }>;
  channels: Array<{
    id: string;
    name: string;
    type: number;
    position: number;
    parentId?: string;
  }>;
  users: Array<{
    id: string;
    username: string;
    globalName?: string;
    avatarUrl?: string;
    bot: boolean;
  }>;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ guildId: string }> }
) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.discordId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { guildId } = await context.params;
  if (!guildId) {
    return NextResponse.json({ error: "Missing guild id" }, { status: 400 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const botApiKey = process.env.BOT_API_KEY;
  if (!botApiKey) {
    return NextResponse.json({ error: "Bot API key is not configured" }, { status: 500 });
  }

  try {
    // Fetch from Go backend cache (populated by bot event handlers)
    const response = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/bot/discord-events/guild/${guildId}/cache`,
      {
        headers: {
          "x-bot-api-key": botApiKey,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error(`Backend cache fetch failed: ${response.status} ${text}`);
      return NextResponse.json(
        { error: `Failed to fetch guild cache: ${response.status}` },
        { status: response.status }
      );
    }

    // Go API wraps responses in {success, data, error} envelope
    const envelope = await response.json();
    const cache: BackendGuildCache = envelope.data ?? { guildId, roles: [], channels: [], users: [] };

    // Map cache data to the expected inventory format
    const roles: DiscordGuildRole[] = cache.roles
      .filter((role) => role.name !== "@everyone")
      .sort((a, b) => b.position - a.position)
      .map((role) => ({
        id: role.id,
        name: role.name,
        color: role.color,
        position: role.position,
        managed: Boolean(role.icon), // roles with icons are often managed (bot roles)
      }));

    const channels: DiscordGuildChannel[] = cache.channels
      .sort((a, b) => a.position - b.position)
      .map((channel) => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        position: channel.position,
        parent_id: channel.parentId ?? null,
      }));

    const users: DiscordGuildUser[] = cache.users
      .sort((a, b) => {
        const left = a.globalName || a.username;
        const right = b.globalName || b.username;
        return left.localeCompare(right);
      })
      .map((user) => ({
        id: user.id,
        username: user.username,
        global_name: user.globalName ?? null,
        avatar: user.avatarUrl ?? null,
        bot: user.bot,
      }));

    const payload: DiscordGuildInventory = {
      guild_id: guildId,
      roles,
      channels,
      users,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Discord guild inventory fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch guild inventory" }, { status: 500 });
  }
}
