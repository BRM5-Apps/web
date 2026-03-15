import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { FactionStats } from "@/types/stats";

export function useStats(factionId: string) {
  return useQuery<FactionStats>({
    queryKey: queryKeys.stats.overview(factionId),
    queryFn: ({ signal }) => api.stats.overview(factionId, { signal }),
    enabled: !!factionId,
    staleTime: 5 * 60 * 1000,
    retry: false, // stats are non-critical; fail fast rather than a 7s retry loop
  });
}
