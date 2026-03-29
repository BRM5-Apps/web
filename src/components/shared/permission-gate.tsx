"use client";

import type { ReactNode } from "react";
import { useHasPermissions } from "@/hooks/use-permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface PermissionGateProps {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
  mode?: "any" | "all";
  tooltipOnDenied?: boolean;
  tooltipMessage?: string;
  serverId?: string;
  /** Show skeleton while loading permissions. Default: true */
  showSkeletonWhileLoading?: boolean;
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
  mode = "all",
  tooltipOnDenied = false,
  tooltipMessage,
  showSkeletonWhileLoading = true,
}: PermissionGateProps) {
  const { allowed, isLoading } = useHasPermissions(permission, mode);

  // Show skeleton while permissions are loading
  if (isLoading && showSkeletonWhileLoading) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (allowed) {
    return <>{children}</>;
  }

  if (!tooltipOnDenied) {
    return <>{fallback}</>;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  const formattedPermissions = permissions.map((entry) => `[${entry}]`);
  const defaultMessage = `You need ${formattedPermissions.join(mode === "all" ? " and " : " or ")} to do this`;
  const deniedContent = fallback ?? children;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-not-allowed" aria-disabled="true" tabIndex={0}>
            <span className="pointer-events-none inline-flex opacity-60">
              {deniedContent}
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltipMessage ?? defaultMessage}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
