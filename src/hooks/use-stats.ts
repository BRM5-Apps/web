import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ServerStats } from "@/types/stats";

export function useStats(serverId: string) {
  return useQuery<ServerStats>({
    queryKey: queryKeys.stats.overview(serverId),
    queryFn: ({ signal }) => api.stats.overview(serverId, { signal }),
    enabled: !!serverId,
    staleTime: 5 * 60 * 1000,
    retry: false, // stats are non-critical; fail fast rather than a 7s retry loop
  });
}
