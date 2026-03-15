import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Punishment } from "@/types/moderation";
import { toast } from "sonner";

export function usePunishments(factionId: string) {
  return useQuery<Punishment[]>({
    queryKey: queryKeys.moderation.punishments(factionId),
    queryFn: ({ signal }) => api.moderation.list(factionId, { signal }),
    enabled: !!factionId,
  });
}

export function useRevokePunishment(factionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (punishmentId: string) =>
      api.moderation.revoke(factionId, punishmentId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.moderation.punishments(factionId),
      });
      toast.success("Punishment revoked");
    },
    onError: () => toast.error("Failed to revoke punishment"),
  });
}
