import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateRelated } from "@/lib/query-utils";
import type { Unit } from "@/types/unit";
import { toast } from "sonner";

export function useUnits(serverId: string) {
  return useQuery<Unit[]>({
    queryKey: queryKeys.units.all(serverId),
    queryFn: ({ signal }) => api.units.list(serverId, { signal }),
    enabled: !!serverId,
  });
}

export function useCreateUnit(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.units.create(serverId, data),
    onSuccess: () => {
      invalidateRelated(queryClient, "units", serverId);
      toast.success("Unit created");
    },
    onError: () => {
      toast.error("Failed to create unit");
    },
  });
}

export function useDeleteUnit(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unitId: string) => api.units.delete(serverId, unitId),
    onSuccess: () => {
      invalidateRelated(queryClient, "units", serverId);
      toast.success("Unit deleted");
    },
    onError: () => {
      toast.error("Failed to delete unit");
    },
  });
}
