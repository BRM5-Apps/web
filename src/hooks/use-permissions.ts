import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { useServerStore } from "@/stores/server-store";

interface PermissionData {
  permissions: string[];
}

type PermissionMode = "all" | "any";
type PermissionInput = string | readonly string[];

function normalizePermissionKey(key: string): string {
  return key.trim();
}

export function usePermissions(serverId: string) {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useQuery<PermissionData>({
    queryKey: queryKeys.permissions.user(serverId),
    queryFn: ({ signal }) => api.permissions.get(serverId, { signal }),
    enabled: !!serverId && isAuthenticated,
    retry: false,
  });

  const permissions = useMemo(
    () =>
      (data?.permissions ?? [])
        .map(normalizePermissionKey)
        .filter((key) => key.length > 0),
    [data?.permissions]
  );
  const permissionSet = useMemo(() => new Set(permissions), [permissions]);

  const hasPermission = useCallback(
    (key: string) => permissionSet.has(normalizePermissionKey(key)),
    [permissionSet]
  );

  return { hasPermission, isLoading, permissions };
}

export function useHasPermissions(
  permissions: PermissionInput,
  mode: PermissionMode = "all"
): { allowed: boolean; isLoading: boolean } {
  const activeServerId = useServerStore((state) => state.activeServerId);
  const userPermissions = useServerStore((state) => state.userPermissions);

  // Check if permissions are loading - they're loading if we have a server but no permissions yet
  const permissionsLoaded = userPermissions.length > 0 || !activeServerId;

  const userPermissionSet = useMemo(
    () => new Set(userPermissions.map(normalizePermissionKey)),
    [userPermissions]
  );

  const list = useMemo(
    () =>
      (Array.isArray(permissions) ? permissions : [permissions])
        .map(normalizePermissionKey)
        .filter((key) => key.length > 0),
    [permissions]
  );

  if (list.length === 0) {
    return { allowed: true, isLoading: false };
  }

  const allowed = mode === "any"
    ? list.some((permission) => userPermissionSet.has(permission))
    : list.every((permission) => userPermissionSet.has(permission));

  return { allowed, isLoading: !permissionsLoaded };
}

export function useHasPermission(permission: string): { allowed: boolean; isLoading: boolean } {
  return useHasPermissions(permission, "all");
}

export function useHasAnyPermission(permissions: readonly string[]): { allowed: boolean; isLoading: boolean } {
  return useHasPermissions(permissions, "any");
}