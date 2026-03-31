import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Server } from "@/types/server";

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

export interface GuildWithServerStatus extends DiscordGuild {
  /** The BRM5 Server record for this guild, or undefined if the bot is not present */
  server: Server | undefined;
  /** Whether the BRM5 bot is present in this guild (a Server record exists) */
  hasBot: boolean;
}

/** Fetch Discord guilds where the current user has ADMINISTRATOR permission */
function useAdminGuilds() {
  return useQuery<DiscordGuild[]>({
    queryKey: queryKeys.discordGuilds.adminGuilds(),
    queryFn: async ({ signal }) => {
      const res = await fetch("/api/discord/guilds", { signal });
      if (!res.ok) throw new Error("Failed to fetch admin guilds");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — guild list doesn't change often
  });
}

/** Fetch BRM5 server data for the given guild IDs */
function useServersByGuildIds(guildIds: string[]) {
  const { isAuthenticated } = useAuth();
  return useQuery<Server[]>({
    queryKey: queryKeys.discordGuilds.serversByGuildIds(guildIds),
    queryFn: ({ signal }) => api.servers.byGuildIds(guildIds, { signal }),
    enabled: guildIds.length > 0 && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    // Don't retry — surface errors immediately so the UI shows them
    // rather than stalling on skeletons for 7+ seconds
    retry: false,
  });
}

/**
 * Returns all Discord guilds where the current user has ADMINISTRATOR permission,
 * each enriched with whether the BRM5 bot is present (hasBot) and the Server record.
 *
 * Sorted alphabetically. Guilds with the bot come first, greyed-out guilds (no bot)
 * are sorted in the same alphabetical order alongside them — the caller uses `hasBot`
 * to apply visual styling.
 */
export function useAdminGuildsWithServers() {
  const guildsQuery = useAdminGuilds();
  const guildIds = guildsQuery.data?.map((g) => g.id) ?? [];
  const serversQuery = useServersByGuildIds(guildIds);

  // Loading is true if:
  // - Guilds are loading (initial fetch)
  // - OR we have guild IDs and servers are still fetching (initial or refetch)
  const isLoading =
    guildsQuery.isLoading ||
    (guildIds.length > 0 && serversQuery.isLoading) ||
    (guildIds.length > 0 && serversQuery.isFetching);

  const isError = guildsQuery.isError || serversQuery.isError;
  const error = guildsQuery.error ?? serversQuery.error;

  let enriched: GuildWithServerStatus[] | undefined;
  if (guildsQuery.data) {
    // Build a fast lookup map from discordGuildId → Server
    const serverMap = new Map<string, Server>(
      (serversQuery.data ?? []).map((f) => [f.discordGuildId, f])
    );

    enriched = guildsQuery.data
      .map((guild) => {
        const server = serverMap.get(guild.id);
        return {
          ...guild,
          server,
          hasBot: server !== undefined,
        };
      })
      // Sort alphabetically (case-insensitive). Both has-bot and no-bot are in the
      // same alphabetical sequence; the page uses hasBot for visual differentiation.
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }

  return { data: enriched, isLoading, isError, error };
}
