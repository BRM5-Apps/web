import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateRelated } from "@/lib/query-utils";
import type { Unit } from "@/types/unit";
import { toast } from "sonner";

export function useUnits(factionId: string) {
  return useQuery<Unit[]>({
    queryKey: queryKeys.units.all(factionId),
    queryFn: ({ signal }) => api.units.list(factionId, { signal }),
    enabled: !!factionId,
  });
}

export function useCreateUnit(factionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.units.create(factionId, data),
    onSuccess: () => {
      invalidateRelated(queryClient, "units", factionId);
      toast.success("Unit created");
    },
    onError: () => {
      toast.error("Failed to create unit");
    },
  });
}

export function useDeleteUnit(factionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unitId: string) => api.units.delete(factionId, unitId),
    onSuccess: () => {
      invalidateRelated(queryClient, "units", factionId);
      toast.success("Unit deleted");
    },
    onError: () => {
      toast.error("Failed to delete unit");
    },
  });
}
