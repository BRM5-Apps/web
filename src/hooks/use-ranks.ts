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

export function useRanks(serverId: string) {
  return useQuery<RankWithDetails[]>({
    queryKey: queryKeys.ranks.all(serverId),
    queryFn: ({ signal }) => api.ranks.list(serverId, { signal }),
    enabled: !!serverId,
  });
}

export function useRank(serverId: string, rankId: string) {
  return useQuery<RankWithDetails>({
    queryKey: queryKeys.ranks.detail(serverId, rankId),
    queryFn: ({ signal }) => api.ranks.get(serverId, rankId, { signal }),
    enabled: !!serverId && !!rankId,
  });
}

export function useCreateRank(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RankPayload) =>
      api.ranks.create(serverId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "ranks", serverId);
    },
  });
}

export function useUpdateRank(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rankId, ...payload }: RankPayload & { rankId: string }) =>
      api.ranks.update(serverId, rankId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.ranks.detail(serverId, variables.rankId),
      });
      invalidateRelated(queryClient, "ranks", serverId);
    },
  });
}

export function useDeleteRank(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rankId: string) =>
      api.ranks.delete(serverId, rankId),
    onSuccess: () => {
      invalidateRelated(queryClient, "ranks", serverId);
    },
  });
}

export function useReorderRanks(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderRanksPayload) =>
      api.ranks.reorder(serverId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "ranks", serverId);
    },
  });
}

export function useRankPermissions(serverId: string, rankId: string) {
  return useQuery<Permission[]>({
    queryKey: queryKeys.ranks.permissions(serverId, rankId),
    queryFn: ({ signal }) =>
      api.ranks.getPermissions(serverId, rankId, { signal }),
    enabled: !!serverId && !!rankId,
  });
}

export function useSetRankPermissions(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rankId,
      permissionIds,
    }: {
      rankId: string;
      permissionIds: string[];
    }) => api.ranks.setPermissions(serverId, rankId, permissionIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.ranks.permissions(serverId, variables.rankId),
      });
      invalidateRelated(queryClient, "ranks", serverId);
    },
  });
}
