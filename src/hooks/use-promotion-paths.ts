import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateRelated } from "@/lib/query-utils";
import type { PromotionPath, PromotionPathPayload } from "@/types/rank";

export function usePromotionPaths(factionId: string) {
  return useQuery<PromotionPath[]>({
    queryKey: queryKeys.promotionPaths.all(factionId),
    queryFn: ({ signal }) => api.promotionPaths.list(factionId, { signal }),
    enabled: !!factionId,
  });
}

export function useCreatePromotionPath(factionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PromotionPathPayload) =>
      api.promotionPaths.create(factionId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "promotionPaths", factionId);
    },
  });
}

export function useUpdatePromotionPath(factionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pathId,
      ...payload
    }: PromotionPathPayload & { pathId: string }) =>
      api.promotionPaths.update(factionId, pathId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "promotionPaths", factionId);
    },
  });
}

export function useDeletePromotionPath(factionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pathId: string) =>
      api.promotionPaths.delete(factionId, pathId),
    onSuccess: () => {
      invalidateRelated(queryClient, "promotionPaths", factionId);
    },
  });
}
