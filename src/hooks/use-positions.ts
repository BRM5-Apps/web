import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateRelated } from "@/lib/query-utils";
import type {
  Position,
  PositionWithHolders,
  PositionPayload,
  PositionAssignment,
  AssignPositionPayload,
} from "@/types/position";

/**
 * Hook to fetch all positions for a server.
 */
export function usePositions(serverId: string) {
  return useQuery<PositionWithHolders[]>({
    queryKey: queryKeys.positions.all(serverId),
    queryFn: ({ signal }) => api.positions.list(serverId, { signal }),
    enabled: !!serverId,
  });
}

/**
 * Hook to fetch a single position by ID.
 */
export function usePosition(serverId: string, positionId: string) {
  return useQuery<PositionWithHolders>({
    queryKey: queryKeys.positions.detail(serverId, positionId),
    queryFn: ({ signal }) => api.positions.get(serverId, positionId, { signal }),
    enabled: !!serverId && !!positionId,
  });
}

/**
 * Hook to create a new position.
 */
export function useCreatePosition(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PositionPayload) =>
      api.positions.create(serverId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "positions", serverId);
    },
  });
}

/**
 * Hook to update an existing position.
 */
export function useUpdatePosition(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      positionId,
      ...payload
    }: PositionPayload & { positionId: string }) =>
      api.positions.update(serverId, positionId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.positions.detail(serverId, variables.positionId),
      });
      invalidateRelated(queryClient, "positions", serverId);
    },
  });
}

/**
 * Hook to delete a position.
 */
export function useDeletePosition(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (positionId: string) =>
      api.positions.delete(serverId, positionId),
    onSuccess: () => {
      invalidateRelated(queryClient, "positions", serverId);
    },
  });
}

/**
 * Hook to assign a position to a member.
 */
export function useAssignPosition(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      positionId,
      payload,
    }: {
      positionId: string;
      payload: AssignPositionPayload;
    }) => api.positions.assign(serverId, positionId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.positions.holders(serverId, variables.positionId),
      });
      invalidateRelated(queryClient, "positions", serverId);
    },
  });
}

/**
 * Hook to unassign a position from a member.
 */
export function useUnassignPosition(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: string) =>
      api.positions.unassign(serverId, assignmentId),
    onSuccess: () => {
      invalidateRelated(queryClient, "positions", serverId);
    },
  });
}

/**
 * Hook to fetch all holders of a position.
 */
export function usePositionHolders(serverId: string, positionId: string) {
  return useQuery<PositionAssignment[]>({
    queryKey: queryKeys.positions.holders(serverId, positionId),
    queryFn: ({ signal }) =>
      api.positions.getHolders(serverId, positionId, { signal }),
    enabled: !!serverId && !!positionId,
  });
}

/**
 * Hook to fetch all positions for a specific member.
 */
export function useMemberPositions(
  serverId: string,
  serverUserId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<PositionAssignment[]>({
    queryKey: queryKeys.positions.memberPositions(serverId, serverUserId),
    queryFn: ({ signal }) =>
      api.positions.getMemberPositions(serverId, serverUserId, { signal }),
    enabled: options?.enabled ?? (!!serverId && !!serverUserId),
  });
}