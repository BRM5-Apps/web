"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { useRanks } from "@/hooks/use-ranks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Shield } from "lucide-react";
import { PERMISSION_KEYS } from "@/lib/constants";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPermission(key: string): string {
  return key
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" › ");
}

// Group permissions by their domain prefix (e.g. "members", "ranks")
function groupPermissions(keys: string[]): Record<string, string[]> {
  return keys.reduce<Record<string, string[]>>((acc, key) => {
    const domain = key.split(".")[0];
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(key);
    return acc;
  }, {});
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useMyPermissions(factionId: string) {
  return useQuery<{ permissions: string[] }>({
    queryKey: queryKeys.permissions.user(factionId),
    queryFn: ({ signal }) => api.permissions.get(factionId, { signal }),
    enabled: !!factionId,
  });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PermissionsPage() {
  const params = useParams<{ factionId: string }>();
  const factionId = params.factionId;

  const { data: permissionsData, isLoading: permsLoading } = useMyPermissions(factionId);
  const { data: ranks, isLoading: ranksLoading } = useRanks(factionId);

  const isLoading = permsLoading || ranksLoading;
  const permissions = permissionsData?.permissions ?? [];
  const grouped = groupPermissions(permissions);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
          <p className="text-muted-foreground">
            Your current permissions for this faction, and per-rank permission settings.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/faction/${factionId}/ranks`}>
            <Shield className="mr-2 h-4 w-4" />
            Manage Ranks
          </Link>
        </Button>
      </div>

      {/* My permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            Your Permissions
          </CardTitle>
          <CardDescription>Permissions granted to your rank in this faction.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-28 rounded-full" />
              ))}
            </div>
          ) : permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No permissions assigned.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([domain, keys]) => (
                <div key={domain}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {domain}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {keys.map((key) => (
                      <Badge key={key} variant="secondary" className="font-mono text-xs">
                        {key}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rank overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-violet-500" />
            Rank Permissions Overview
          </CardTitle>
          <CardDescription>
            Select a rank below to manage its permissions in detail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : !ranks || ranks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ranks found.</p>
          ) : (
            <div className="space-y-2">
              {[...ranks].sort((a, b) => b.level - a.level).map((rank) => (
                <Link
                  key={rank.id}
                  href={`/faction/${factionId}/ranks`}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/40"
                >
                  <div className="flex items-center gap-3">
                    {rank.color && (
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: rank.color }}
                      />
                    )}
                    <span className="text-sm font-medium">{rank.name}</span>
                    <span className="text-xs text-muted-foreground">Level {rank.level}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {rank.permissions?.length ?? 0} permissions
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
