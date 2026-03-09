import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Rank } from "@/types/rank";

export function useRanks(factionId: string) {
  return useQuery<Rank[]>({
    queryKey: ["ranks", factionId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/factions/${factionId}/ranks`);
      return data;
    },
    enabled: !!factionId,
  });
}
