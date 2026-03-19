import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Punishment } from "@/types/moderation";
import { toast } from "sonner";

export function usePunishments(serverId: string) {
  return useQuery<Punishment[]>({
    queryKey: queryKeys.moderation.punishments(serverId),
    queryFn: ({ signal }) => api.moderation.list(serverId, { signal }),
    enabled: !!serverId,
  });
}

export function useRevokePunishment(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (punishmentId: string) =>
      api.moderation.revoke(serverId, punishmentId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.moderation.punishments(serverId),
      });
      toast.success("Punishment revoked");
    },
    onError: () => toast.error("Failed to revoke punishment"),
  });
}
