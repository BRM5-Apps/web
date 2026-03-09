import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Event } from "@/types/event";

export function useEvents(factionId: string) {
  return useQuery<Event[]>({
    queryKey: ["events", factionId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/factions/${factionId}/events`);
      return data;
    },
    enabled: !!factionId,
  });
}
