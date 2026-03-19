import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import type { DiscordGuildInventory, DiscordGuildChannel, DiscordGuildRole, DiscordGuildUser } from "@/types/discord-inventory";

const DISCORD_API_BASE = "https://discord.com/api/v10";
const MEMBER_PAGE_SIZE = 1000;
const MAX_MEMBER_PAGES = 20;

interface DiscordApiRole {
  id: string;
  name: string;
  color: number;
  position: number;
  managed: boolean;
}

interface DiscordApiChannel {
  id: string;
  name: string;
  type: number;
  position: number;
  parent_id?: string | null;
}

interface DiscordApiMember {
  user?: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
    bot?: boolean;
  };
}

async function discordBotFetch<T>(path: string, botToken: string): Promise<T> {
  const response = await fetch(`${DISCORD_API_BASE}${path}`, {
    headers: {
      Authorization: `Bot ${botToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Discord API ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

async function fetchAllMembers(guildId: string, botToken: string): Promise<DiscordGuildUser[]> {
  const members: DiscordGuildUser[] = [];
  let after = "0";

  for (let page = 0; page < MAX_MEMBER_PAGES; page += 1) {
    const batch = await discordBotFetch<DiscordApiMember[]>(
      `/guilds/${guildId}/members?limit=${MEMBER_PAGE_SIZE}&after=${after}`,
      botToken
    );

    if (batch.length === 0) {
      break;
    }

    for (const member of batch) {
      if (!member.user) continue;
      members.push({
        id: member.user.id,
        username: member.user.username,
        global_name: member.user.global_name ?? null,
        avatar: member.user.avatar ?? null,
        bot: member.user.bot ?? false,
      });
    }

    after = batch[batch.length - 1]?.user?.id ?? after;
    if (batch.length < MEMBER_PAGE_SIZE) {
      break;
    }
  }

  return members;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ guildId: string }> }
) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.discordId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN || process.env.TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "Discord bot token is not configured" }, { status: 500 });
  }

  const { guildId } = await context.params;
  if (!guildId) {
    return NextResponse.json({ error: "Missing guild id" }, { status: 400 });
  }

  try {
    const [rolesResponse, channelsResponse, users] = await Promise.all([
      discordBotFetch<DiscordApiRole[]>(`/guilds/${guildId}/roles`, botToken),
      discordBotFetch<DiscordApiChannel[]>(`/guilds/${guildId}/channels`, botToken),
      fetchAllMembers(guildId, botToken),
    ]);

    const roles: DiscordGuildRole[] = rolesResponse
      .filter((role) => role.name !== "@everyone")
      .sort((a, b) => b.position - a.position)
      .map((role) => ({
        id: role.id,
        name: role.name,
        color: role.color,
        position: role.position,
        managed: role.managed,
      }));

    const channels: DiscordGuildChannel[] = channelsResponse
      .sort((a, b) => a.position - b.position)
      .map((channel) => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        position: channel.position,
        parent_id: channel.parent_id ?? null,
      }));

    const payload: DiscordGuildInventory = {
      guild_id: guildId,
      roles,
      channels,
      users: users.sort((a, b) => {
        const left = a.global_name || a.username;
        const right = b.global_name || b.username;
        return left.localeCompare(right);
      }),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Discord guild inventory fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch guild inventory" }, { status: 500 });
  }
}
