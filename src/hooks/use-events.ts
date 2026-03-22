import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Event } from "@/types/event";

export function useEvents(serverId: string) {
  return useQuery<Event[]>({
    queryKey: queryKeys.events.all(serverId),
    queryFn: ({ signal }) => api.events.list(serverId, undefined, { signal }),
    enabled: !!serverId,
  });
}
