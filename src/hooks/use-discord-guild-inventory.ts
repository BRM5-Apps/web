"use client";

import { useQuery } from "@tanstack/react-query";
import type { DiscordGuildInventory } from "@/types/discord-inventory";

export function useDiscordGuildInventory(guildId?: string) {
  return useQuery<DiscordGuildInventory>({
    queryKey: ["discord", "guild-inventory", guildId],
    enabled: Boolean(guildId),
    staleTime: 1000 * 60,
    queryFn: async ({ signal, queryKey }) => {
      const currentGuildId = queryKey[2] as string;
      if (!currentGuildId) {
        throw new Error("guildId is required");
      }
      const response = await fetch(`/api/discord/guilds/${currentGuildId}/inventory?t=${Date.now()}`, {
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
