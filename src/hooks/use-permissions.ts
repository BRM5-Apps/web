import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { useFactionStore } from "@/stores/faction-store";

interface PermissionData {
  permissions: string[];
}

type PermissionMode = "all" | "any";
type PermissionInput = string | readonly string[];

function normalizePermissionKey(key: string): string {
  return key.trim();
}

export function usePermissions(factionId: string) {
  const { data, isLoading } = useQuery<PermissionData>({
    queryKey: queryKeys.permissions.user(factionId),
    queryFn: ({ signal }) => api.permissions.get(factionId, { signal }),
    enabled: !!factionId,
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
): boolean {
  const userPermissions = useFactionStore((state) => state.userPermissions);
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
    return true;
  }

  return mode === "any"
    ? list.some((permission) => userPermissionSet.has(permission))
    : list.every((permission) => userPermissionSet.has(permission));
}

export function useHasPermission(permission: string): boolean {
  return useHasPermissions(permission, "all");
}

export function useHasAnyPermission(permissions: readonly string[]): boolean {
  return useHasPermissions(permissions, "any");
}
