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

// In-memory cache for guilds (per-user, with TTL)
interface CachedGuilds {
  guilds: DiscordGuild[];
  timestamp: number;
}
const guildsCache = new Map<string, CachedGuilds>();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

// In-flight request deduplication - prevents multiple concurrent requests for the same user
const inflightRequests = new Map<string, Promise<DiscordGuild[]>>();

async function fetchGuildsFromDiscord(accessToken: string, userId: string): Promise<DiscordGuild[]> {
  // Check if there's already an in-flight request for this user
  const existing = inflightRequests.get(userId);
  if (existing) {
    return existing;
  }

  // Create the fetch promise
  const fetchPromise = (async () => {
    try {
      let res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Handle Discord rate limit (429)
      if (res.status === 429) {
        const rateLimitData = await res.json();
        const retryAfter = (rateLimitData.retry_after ?? 1) * 1000;
        console.warn(`Discord guilds rate limited, waiting ${retryAfter}ms`);

        await new Promise(resolve => setTimeout(resolve, retryAfter));
        res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      if (!res.ok) {
        throw new Error(`Discord API error: ${res.status}`);
      }

      const guilds: DiscordGuild[] = await res.json();

      // Filter to admin guilds
      const adminGuilds = guilds.filter((g) => {
        if (g.owner) return true;
        const perms = BigInt(g.permissions);
        return (perms & ADMINISTRATOR) === ADMINISTRATOR || (perms & MANAGE_GUILD) === MANAGE_GUILD;
      });

      // Cache the result
      guildsCache.set(userId, { guilds: adminGuilds, timestamp: Date.now() });

      return adminGuilds;
    } finally {
      // Always clean up the in-flight request
      inflightRequests.delete(userId);
    }
  })();

  // Store the in-flight request
  inflightRequests.set(userId, fetchPromise);
  return fetchPromise;
}

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.discordAccessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = token.sub;
  if (!userId) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Check cache first
  const cached = guildsCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.guilds);
  }

  try {
    // Fetch with deduplication - concurrent requests will wait for the same promise
    const guilds = await fetchGuildsFromDiscord(token.discordAccessToken as string, userId);
    return NextResponse.json(guilds);
  } catch (error) {
    console.error("Failed to fetch guilds:", error);

    // Return stale cache on error
    if (cached) {
      return NextResponse.json(cached.guilds);
    }

    return NextResponse.json(
      { error: "Failed to fetch guilds" },
      { status: 500 }
    );
  }
}