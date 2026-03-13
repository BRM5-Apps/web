import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { invalidateRelated } from "@/lib/query-utils";

interface PromoteDemotePayload {
  factionUserId: string;
  reason?: string;
}

interface KickPayload {
  factionUserId: string;
  reason?: string;
}

export function usePromoteMember(factionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PromoteDemotePayload) =>
      api.ranks.promote(factionId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "members", factionId);
    },
  });
}

export function useDemoteMember(factionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PromoteDemotePayload) =>
      api.ranks.demote(factionId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "members", factionId);
    },
  });
}

export function useKickMember(factionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: KickPayload) =>
      api.members.kick(factionId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "members", factionId);
    },
  });
}
