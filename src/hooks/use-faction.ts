import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateRelated } from "@/lib/query-utils";
import type { Faction, PaginatedMembers } from "@/types/faction";

export function useFaction(factionId: string) {
  return useQuery<Faction>({
    queryKey: queryKeys.factions.detail(factionId),
    queryFn: ({ signal }) => api.factions.get(factionId, { signal }),
    enabled: !!factionId,
  });
}

export function useFactions() {
  return useQuery<Faction[]>({
    queryKey: queryKeys.factions.lists(),
    queryFn: ({ signal }) => api.factions.list({ signal }),
  });
}

export interface MemberQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  rankId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useFactionMembers(factionId: string, params: MemberQueryParams = {}) {
  return useQuery<PaginatedMembers>({
    queryKey: queryKeys.members.list(factionId, params as Record<string, unknown>),
    queryFn: ({ signal }) =>
      api.members.list(
        factionId,
        {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          ...(params.search && { search: params.search }),
          ...(params.rankId && { rankId: params.rankId }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
        },
        { signal }
      ),
    enabled: !!factionId,
  });
}

export function useUpdateFaction(factionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Pick<Faction, "name" | "description" | "iconUrl">>) =>
      api.factions.update(factionId, data),
    onSuccess: () => {
      invalidateRelated(queryClient, "faction", factionId);
    },
  });
}

export function useDeleteFaction(factionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.factions.delete(factionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.factions.all });
    },
  });
}
