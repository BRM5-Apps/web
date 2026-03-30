import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateRelated } from "@/lib/query-utils";
import type {
  RankBranch,
  BranchPayload,
  MemberBranchProgress,
  PathOrderPayload,
} from "@/types/branch";

/**
 * Hook to fetch all branches for a server.
 */
export function useBranches(serverId: string) {
  return useQuery<RankBranch[]>({
    queryKey: queryKeys.branches.all(serverId),
    queryFn: ({ signal }) => api.branches.list(serverId, { signal }),
    enabled: !!serverId,
  });
}

/**
 * Hook to fetch a single branch by ID.
 */
export function useBranch(serverId: string, branchId: string) {
  return useQuery<RankBranch>({
    queryKey: queryKeys.branches.detail(serverId, branchId),
    queryFn: ({ signal }) => api.branches.get(serverId, branchId, { signal }),
    enabled: !!serverId && !!branchId,
  });
}

/**
 * Hook to create a new branch.
 */
export function useCreateBranch(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BranchPayload) =>
      api.branches.create(serverId, payload),
    onSuccess: () => {
      invalidateRelated(queryClient, "branches", serverId);
    },
  });
}

/**
 * Hook to update an existing branch.
 */
export function useUpdateBranch(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      branchId,
      ...payload
    }: BranchPayload & { branchId: string }) =>
      api.branches.update(serverId, branchId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.branches.detail(serverId, variables.branchId),
      });
      invalidateRelated(queryClient, "branches", serverId);
    },
  });
}

/**
 * Hook to delete a branch.
 */
export function useDeleteBranch(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branchId: string) =>
      api.branches.delete(serverId, branchId),
    onSuccess: () => {
      invalidateRelated(queryClient, "branches", serverId);
    },
  });
}

/**
 * Hook to update the path order for a branch.
 */
export function useUpdateBranchPathOrder(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      branchId,
      payload,
    }: {
      branchId: string;
      payload: PathOrderPayload;
    }) => api.branches.updatePathOrder(serverId, branchId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.branches.detail(serverId, variables.branchId),
      });
      invalidateRelated(queryClient, "branches", serverId);
    },
  });
}

/**
 * Hook to fetch a member's progress in all branches.
 */
export function useMemberBranchProgress(serverId: string, serverUserId: string) {
  return useQuery<MemberBranchProgress[]>({
    queryKey: queryKeys.branches.memberProgress(serverId, serverUserId),
    queryFn: ({ signal }) =>
      api.branches.getMemberProgress(serverId, serverUserId, { signal }),
    enabled: !!serverId && !!serverUserId,
  });
}