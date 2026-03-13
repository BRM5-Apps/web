import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateRelated } from "@/lib/query-utils";
import type {
  Rank,
  RankWithDetails,
  RankPayload,
  ReorderRanksPayload,
  Permission,
} from "@/types/rank";

export function useRanks(factionId: string) {
  return useQuery<RankWithDetails[]>({
    queryKey: queryKeys.ranks.all(factionId),
    queryFn: ({ signal }) => api.ranks.list(factionId, { signal }),
    enabled: !!factionId,
  });
}

export function useRank(factionId: string, rankId: string) {
  return useQuery<RankWithDetails>({
    queryKey: queryKeys.ranks.detail(factionId, rankId),
    queryFn: ({ signal }) => api.ranks.get(factionId, rankId, { signal }),
    enabled: !!factionId && !!rankId,
  });
}

export function useCreateRank(factionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RankPayload) =>
      api.ranks.create(factionId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "ranks", factionId);
    },
  });
}

export function useUpdateRank(factionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rankId, ...payload }: RankPayload & { rankId: string }) =>
      api.ranks.update(factionId, rankId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.ranks.detail(factionId, variables.rankId),
      });
      invalidateRelated(queryClient, "ranks", factionId);
    },
  });
}

export function useDeleteRank(factionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rankId: string) =>
      api.ranks.delete(factionId, rankId),
    onSuccess: () => {
      invalidateRelated(queryClient, "ranks", factionId);
    },
  });
}

export function useReorderRanks(factionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderRanksPayload) =>
      api.ranks.reorder(factionId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "ranks", factionId);
    },
  });
}

export function useRankPermissions(factionId: string, rankId: string) {
  return useQuery<Permission[]>({
    queryKey: queryKeys.ranks.permissions(factionId, rankId),
    queryFn: ({ signal }) =>
      api.ranks.getPermissions(factionId, rankId, { signal }),
    enabled: !!factionId && !!rankId,
  });
}

export function useSetRankPermissions(factionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rankId,
      permissionIds,
    }: {
      rankId: string;
      permissionIds: string[];
    }) => api.ranks.setPermissions(factionId, rankId, permissionIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.ranks.permissions(factionId, variables.rankId),
      });
      invalidateRelated(queryClient, "ranks", factionId);
    },
  });
}
