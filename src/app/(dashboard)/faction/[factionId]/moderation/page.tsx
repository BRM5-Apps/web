"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, RefreshCw, Lock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePunishments, useRevokePunishment } from "@/hooks/use-moderation";
import type { Punishment } from "@/types/moderation";

const TYPE_BADGE_CLASSES: Record<Punishment["type"], string> = {
  warn: "bg-amber-500/20 text-amber-400",
  mute: "bg-orange-500/20 text-orange-400",
  kick: "bg-red-500/20 text-red-400",
  ban: "bg-red-700/20 text-red-500",
};

function PunishmentsTab({ factionId }: { factionId: string }) {
  const [filter, setFilter] = useState<"active" | "all">("active");
  const { data: punishments, isLoading, isError, error, refetch } = usePunishments(factionId);
  const revoke = useRevokePunishment(factionId);

  const filtered =
    filter === "active" ? punishments?.filter((p) => p.isActive) : punishments;

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as "active" | "all")}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div>
            <p className="font-medium">Failed to load punishments</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : !filtered?.length ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No punishments found.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.userId}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={TYPE_BADGE_CLASSES[p.type]}>
                      {p.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">{p.reason}</TableCell>
                  <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : "Permanent"}
                  </TableCell>
                  <TableCell className="text-right">
                    {p.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={revoke.isPending}
                        onClick={() => revoke.mutate(p.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function BlacklistTab({ factionId }: { factionId: string }) {
  const { data: punishments, isLoading, isError, error, refetch } = usePunishments(factionId);
  const revoke = useRevokePunishment(factionId);

  const bans = punishments?.filter((p) => p.type === "ban" && p.isActive) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div>
          <p className="font-medium">Failed to load blacklist</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!bans.length) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">No blacklisted members.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Issued</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bans.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.userId}</TableCell>
              <TableCell className="max-w-[300px] truncate">{p.reason}</TableCell>
              <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={revoke.isPending}
                  onClick={() => revoke.mutate(p.id)}
                >
                  Revoke
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PromoLocksTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-orange-400" />
          Promo Locks
        </CardTitle>
        <CardDescription>Prevent specific members from being promoted.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Promo lock management coming soon.</p>
      </CardContent>
    </Card>
  );
}

export default function ModerationPage() {
  const { factionId } = useParams<{ factionId: string }>();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Moderation</h1>
        <p className="text-muted-foreground">
          Manage punishments, blacklists, and promotion locks for your faction.
        </p>
      </div>

      <Tabs defaultValue="punishments">
        <TabsList>
          <TabsTrigger value="punishments">Punishments</TabsTrigger>
          <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
          <TabsTrigger value="promo-locks">Promo Locks</TabsTrigger>
        </TabsList>

        <TabsContent value="punishments" className="mt-4">
          <PunishmentsTab factionId={factionId} />
        </TabsContent>

        <TabsContent value="blacklist" className="mt-4">
          <BlacklistTab factionId={factionId} />
        </TabsContent>

        <TabsContent value="promo-locks" className="mt-4">
          <PromoLocksTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
