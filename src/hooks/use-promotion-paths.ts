import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateRelated } from "@/lib/query-utils";
import type { PromotionPath, PromotionPathPayload } from "@/types/rank";

export function usePromotionPaths(serverId: string) {
  return useQuery<PromotionPath[]>({
    queryKey: queryKeys.promotionPaths.all(serverId),
    queryFn: ({ signal }) => api.promotionPaths.list(serverId, { signal }),
    enabled: !!serverId,
  });
}

export function useCreatePromotionPath(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PromotionPathPayload) =>
      api.promotionPaths.create(serverId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "promotionPaths", serverId);
    },
  });
}

export function useUpdatePromotionPath(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pathId,
      ...payload
    }: PromotionPathPayload & { pathId: string }) =>
      api.promotionPaths.update(serverId, pathId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "promotionPaths", serverId);
    },
  });
}

export function useDeletePromotionPath(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pathId: string) =>
      api.promotionPaths.delete(serverId, pathId),
    onSuccess: () => {
      invalidateRelated(queryClient, "promotionPaths", serverId);
    },
  });
}
