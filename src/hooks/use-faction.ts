import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateRelated } from "@/lib/query-utils";
import type { Server, PaginatedMembers } from "@/types/server";

export function useServer(serverId: string) {
  return useQuery<Server>({
    queryKey: queryKeys.servers.detail(serverId),
    queryFn: ({ signal }) => api.servers.get(serverId, { signal }),
    enabled: !!serverId,
  });
}

export function useServers() {
  return useQuery<Server[]>({
    queryKey: queryKeys.servers.lists(),
    queryFn: ({ signal }) => api.servers.list({ signal }),
  });
}

export interface MemberQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  rankId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useServerMembers(serverId: string, params: MemberQueryParams = {}) {
  return useQuery<PaginatedMembers>({
    queryKey: queryKeys.members.list(serverId, params as Record<string, unknown>),
    queryFn: ({ signal }) =>
      api.members.list(
        serverId,
        {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          ...(params.search && { search: params.search }),
          ...(params.rankId && { rankId: params.rankId }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
        },
        { signal }
      ),
    enabled: !!serverId,
  });
}

export function useUpdateServer(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Pick<Server, "name" | "description" | "iconUrl">>) =>
      api.servers.update(serverId, data),
    onSuccess: () => {
      invalidateRelated(queryClient, "server", serverId);
    },
  });
}

export function useDeleteServer(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.servers.delete(serverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.servers.all });
    },
  });
}
