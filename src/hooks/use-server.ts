import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateRelated } from "@/lib/query-utils";
import type { Server, PaginatedMembers } from "@/types/server";

// API returns { server: { server: Server, member_count: number } }
// The backend wraps the response in an extra 'server' key
interface ServerWithMeta {
  server: {
    server: Server;
    member_count: number;
  };
}

export function useServer(serverId: string) {
  return useQuery<ServerWithMeta>({
    queryKey: queryKeys.servers.detail(serverId),
    queryFn: async ({ signal }) => {
      // API client type says { server: Server; member_count: number }
      // But actual response is { server: { server: Server; member_count: number } }
      const response = await api.servers.get(serverId, { signal }) as unknown as ServerWithMeta;
      return response;
    },
    enabled: !!serverId,
    retry: false,
  });
}

export function useServers(options?: { enabled?: boolean }) {
  return useQuery<Server[]>({
    queryKey: queryKeys.servers.lists(),
    queryFn: ({ signal }) => api.servers.list({ signal }),
    enabled: options?.enabled ?? true,
    retry: false,
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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Pick<Server, "name" | "description" | "iconUrl">>) =>
      api.servers.update(serverId, data),
    onSuccess: () => {
      invalidateRelated(qc, "server", serverId);
    },
  });
}

export function useDeleteServer(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.servers.delete(serverId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.servers.all });
    },
  });
}
