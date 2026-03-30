import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateRelated } from "@/lib/query-utils";
import type { Unit, UnitMember, UnitTreeNode, UnitCapPayload, MoveUnitPayload } from "@/types/unit";
import { toast } from "sonner";

export function useUnits(serverId: string) {
  return useQuery<Unit[]>({
    queryKey: queryKeys.units.all(serverId),
    queryFn: ({ signal }) => api.units.list(serverId, { signal }),
    enabled: !!serverId,
  });
}

export function useUnitTree(serverId: string) {
  return useQuery<UnitTreeNode[]>({
    queryKey: queryKeys.units.tree(serverId),
    queryFn: ({ signal }) => api.units.getTree(serverId, { signal }),
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

export function useUpdateUnit(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      unitId,
      data,
    }: {
      unitId: string;
      data: Partial<Unit>;
    }) => api.units.update(serverId, unitId, data),
    onSuccess: () => {
      invalidateRelated(queryClient, "units", serverId);
      toast.success("Unit updated");
    },
    onError: () => {
      toast.error("Failed to update unit");
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

export function useSetUnitCap(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      unitId,
      data,
    }: {
      unitId: string;
      data: UnitCapPayload;
    }) => api.units.setCap(serverId, unitId, data),
    onSuccess: () => {
      invalidateRelated(queryClient, "units", serverId);
      toast.success("Unit cap updated");
    },
    onError: () => {
      toast.error("Failed to update unit cap");
    },
  });
}

export function useMoveUnit(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      unitId,
      data,
    }: {
      unitId: string;
      data: MoveUnitPayload;
    }) => api.units.move(serverId, unitId, data),
    onSuccess: () => {
      invalidateRelated(queryClient, "units", serverId);
      toast.success("Unit moved");
    },
    onError: () => {
      toast.error("Failed to move unit");
    },
  });
}

export function useUnitMembers(serverId: string, unitId: string) {
  return useQuery<UnitMember[]>({
    queryKey: [...queryKeys.units.detail(serverId, unitId), "members"],
    queryFn: ({ signal }) => api.units.listMembers(serverId, unitId, { signal }),
    enabled: !!serverId && !!unitId,
  });
}

export function useAddUnitMember(serverId: string, unitId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serverUserId: string) =>
      api.units.addMember(serverId, unitId, { serverUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.units.detail(serverId, unitId), "members"],
      });
      invalidateRelated(queryClient, "units", serverId);
      toast.success("Member added to unit");
    },
    onError: () => {
      toast.error("Failed to add member to unit");
    },
  });
}

export function useRemoveUnitMember(serverId: string, unitId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serverUserId: string) =>
      api.units.removeMember(serverId, unitId, serverUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.units.detail(serverId, unitId), "members"],
      });
      invalidateRelated(queryClient, "units", serverId);
      toast.success("Member removed from unit");
    },
    onError: () => {
      toast.error("Failed to remove member from unit");
    },
  });
}