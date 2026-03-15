import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Faction } from "@/types/faction";

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

export interface GuildWithFactionStatus extends DiscordGuild {
  /** The BRM5 Faction record for this guild, or undefined if the bot is not present */
  faction: Faction | undefined;
  /** Whether the BRM5 bot is present in this guild (a Faction record exists) */
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

/** Fetch BRM5 faction data for the given guild IDs */
function useFactionsByGuildIds(guildIds: string[]) {
  return useQuery<Faction[]>({
    queryKey: queryKeys.discordGuilds.factionsByGuildIds(guildIds),
    queryFn: ({ signal }) => api.factions.byGuildIds(guildIds, { signal }),
    enabled: guildIds.length > 0,
    staleTime: 5 * 60 * 1000,
    // Don't retry — surface errors immediately so the UI shows them
    // rather than stalling on skeletons for 7+ seconds
    retry: false,
  });
}

/**
 * Returns all Discord guilds where the current user has ADMINISTRATOR permission,
 * each enriched with whether the BRM5 bot is present (hasBot) and the Faction record.
 *
 * Sorted alphabetically. Guilds with the bot come first, greyed-out guilds (no bot)
 * are sorted in the same alphabetical order alongside them — the caller uses `hasBot`
 * to apply visual styling.
 */
export function useAdminGuildsWithFactions() {
  const guildsQuery = useAdminGuilds();
  const guildIds = guildsQuery.data?.map((g) => g.id) ?? [];
  const factionsQuery = useFactionsByGuildIds(guildIds);

  const isLoading = guildsQuery.isLoading || (guildIds.length > 0 && factionsQuery.isLoading);
  const isError = guildsQuery.isError || factionsQuery.isError;
  const error = guildsQuery.error ?? factionsQuery.error;

  let enriched: GuildWithFactionStatus[] | undefined;
  if (guildsQuery.data) {
    // Build a fast lookup map from discordGuildId → Faction
    const factionMap = new Map<string, Faction>(
      (factionsQuery.data ?? []).map((f) => [f.discordGuildId, f])
    );

    enriched = guildsQuery.data
      .map((guild) => {
        const faction = factionMap.get(guild.id);
        return {
          ...guild,
          faction,
          hasBot: faction !== undefined,
        };
      })
      // Sort alphabetically (case-insensitive). Both has-bot and no-bot are in the
      // same alphabetical sequence; the page uses hasBot for visual differentiation.
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }

  return { data: enriched, isLoading, isError, error };
}
