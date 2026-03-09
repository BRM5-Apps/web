import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { FactionStats } from "@/types/stats";

export function useStats(factionId: string) {
  return useQuery<FactionStats>({
    queryKey: ["stats", factionId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/factions/${factionId}/stats/overview`);
      return data;
    },
    enabled: !!factionId,
  });
}
