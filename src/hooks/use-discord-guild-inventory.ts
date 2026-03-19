"use client";

import { useQuery } from "@tanstack/react-query";
import type { DiscordGuildInventory } from "@/types/discord-inventory";

export function useDiscordGuildInventory(guildId?: string) {
  return useQuery<DiscordGuildInventory>({
    queryKey: ["discord", "guild-inventory", guildId],
    enabled: Boolean(guildId),
    staleTime: 1000 * 60,
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/discord/guilds/${guildId}/inventory`, {
        signal,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load guild inventory");
      }

      return response.json() as Promise<DiscordGuildInventory>;
    },
  });
}
