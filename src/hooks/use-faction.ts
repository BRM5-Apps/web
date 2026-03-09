import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Faction } from "@/types/faction";

export function useFaction(factionId: string) {
  return useQuery<Faction>({
    queryKey: ["faction", factionId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/factions/${factionId}`);
      return data;
    },
    enabled: !!factionId,
  });
}

export function useFactions() {
  return useQuery<Faction[]>({
    queryKey: ["factions"],
    queryFn: async () => {
      const { data } = await apiClient.get("/factions");
      return data;
    },
  });
}
