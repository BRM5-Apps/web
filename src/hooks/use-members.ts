import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateRelated } from "@/lib/query-utils";

interface PromoteDemotePayload {
  serverUserId: string;
  reason?: string;
}

interface KickPayload {
  serverUserId: string;
  reason?: string;
}

export function useMembers(serverId: string) {
  return useQuery({
    queryKey: queryKeys.members.list(serverId, {}),
    queryFn: ({ signal }) => api.members.list(serverId, {}, { signal }),
    enabled: !!serverId,
  });
}

export function usePromoteMember(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PromoteDemotePayload) =>
      api.ranks.promote(serverId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "members", serverId);
    },
  });
}

export function useDemoteMember(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PromoteDemotePayload) =>
      api.ranks.demote(serverId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "members", serverId);
    },
  });
}

export function useKickMember(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: KickPayload) =>
      api.members.kick(serverId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "members", serverId);
    },
  });
}
