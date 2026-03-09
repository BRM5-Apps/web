"use client";

import { usePermissions } from "@/hooks/use-permissions";
import type { ReactNode } from "react";

interface PermissionGateProps {
  permission: string;
  factionId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({
  permission,
  factionId,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, isLoading } = usePermissions(factionId);

  if (isLoading) return null;
  if (!hasPermission(permission)) return <>{fallback}</>;

  return <>{children}</>;
}
