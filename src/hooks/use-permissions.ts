import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useCallback } from "react";

interface PermissionData {
  permissions: string[];
}

export function usePermissions(factionId: string) {
  const { data, isLoading } = useQuery<PermissionData>({
    queryKey: ["permissions", factionId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/factions/${factionId}/permissions`);
      return data;
    },
    enabled: !!factionId,
  });

  const hasPermission = useCallback(
    (key: string) => data?.permissions?.includes(key) ?? false,
    [data]
  );

  return { hasPermission, isLoading, permissions: data?.permissions ?? [] };
}
