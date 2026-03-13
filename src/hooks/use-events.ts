import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Event } from "@/types/event";

export function useEvents(factionId: string) {
  return useQuery<Event[]>({
    queryKey: queryKeys.events.all(factionId),
    queryFn: ({ signal }) => api.events.list(factionId, undefined, { signal }),
    enabled: !!factionId,
  });
}
