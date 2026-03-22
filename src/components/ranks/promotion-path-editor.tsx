"use client";

import { useState } from "react";
import {
  usePromotionPaths,
  useCreatePromotionPath,
  useDeletePromotionPath,
} from "@/hooks/use-promotion-paths";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import type { RankWithDetails, PromotionPath } from "@/types/rank";

interface PromotionPathEditorProps {
  serverId: string;
  ranks: RankWithDetails[];
  canManage: boolean;
}

export function PromotionPathEditor({
  serverId,
  ranks,
  canManage,
}: PromotionPathEditorProps) {
  const { data: paths, isLoading } = usePromotionPaths(serverId);
  const createMutation = useCreatePromotionPath(serverId);
  const deleteMutation = useDeletePromotionPath(serverId);

  // Form state for new path
  const [fromRankId, setFromRankId] = useState("");
  const [toRankId, setToRankId] = useState("");
  const [requiredPoints, setRequiredPoints] = useState<number | "">("");
  const [requiredEvents, setRequiredEvents] = useState<number | "">("");
  const [requiredDays, setRequiredDays] = useState<number | "">("");
  const [autoPromote, setAutoPromote] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PromotionPath | null>(null);

  // Filter "to" ranks to only show higher levels than "from"
  const fromRank = ranks.find((r) => r.id === fromRankId);
  const toRankOptions = fromRank
    ? ranks.filter((r) => r.level > fromRank.level)
    : ranks;

  function getRankName(rankId: string) {
    return ranks.find((r) => r.id === rankId)?.name ?? "Unknown";
  }

  function getRankColor(rankId: string) {
    return ranks.find((r) => r.id === rankId)?.color ?? "#6b7280";
  }

  async function handleCreate() {
    if (!fromRankId || !toRankId) return;

    await createMutation.mutateAsync({
      fromRankId,
      toRankId,
      requiredPoints: requiredPoints !== "" ? requiredPoints : undefined,
      requiredEvents: requiredEvents !== "" ? requiredEvents : undefined,
      requiredDays: requiredDays !== "" ? requiredDays : undefined,
      autoPromote,
    });

    // Reset form
    setFromRankId("");
    setToRankId("");
    setRequiredPoints("");
    setRequiredEvents("");
    setRequiredDays("");
    setAutoPromote(false);
  }

  return (
    <div className="space-y-6">
      {/* Add path form */}
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Promotion Path</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>From Rank</Label>
                <Select value={fromRankId} onValueChange={setFromRankId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rank..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ranks.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} (Lv.{r.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Rank</Label>
                <Select value={toRankId} onValueChange={setToRankId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rank..." />
                  </SelectTrigger>
                  <SelectContent>
                    {toRankOptions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} (Lv.{r.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Required Points</Label>
                <Input
                  type="number"
                  min={0}
                  value={requiredPoints}
                  onChange={(e) =>
                    setRequiredPoints(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label>Required Events</Label>
                <Input
                  type="number"
                  min={0}
                  value={requiredEvents}
                  onChange={(e) =>
                    setRequiredEvents(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label>Required Days</Label>
                <Input
                  type="number"
                  min={0}
                  value={requiredDays}
                  onChange={(e) =>
                    setRequiredDays(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  id="auto-promote"
                  checked={autoPromote}
                  onCheckedChange={setAutoPromote}
                />
                <Label htmlFor="auto-promote">
                  Auto-promote when requirements are met
                </Label>
              </div>
              <Button
                onClick={handleCreate}
                disabled={
                  !fromRankId || !toRankId || createMutation.isPending
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                {createMutation.isPending ? "Adding..." : "Add Path"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing paths table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Promotion Paths</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : paths && paths.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Auto</TableHead>
                  {canManage && <TableHead className="w-[60px]" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paths.map((path) => (
                  <TableRow key={path.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: getRankColor(path.fromRankId),
                            color: getRankColor(path.fromRankId),
                          }}
                        >
                          {getRankName(path.fromRankId)}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: getRankColor(path.toRankId),
                            color: getRankColor(path.toRankId),
                          }}
                        >
                          {getRankName(path.toRankId)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {path.requiredPoints ?? "—"}
                    </TableCell>
                    <TableCell>
                      {path.requiredEvents ?? "—"}
                    </TableCell>
                    <TableCell>
                      {path.requiredDays ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={path.autoPromote ? "default" : "secondary"}
                      >
                        {path.autoPromote ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No promotion paths configured
            </p>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Promotion Path"
        description={
          deleteTarget
            ? `Remove the promotion path from ${getRankName(deleteTarget.fromRankId)} to ${getRankName(deleteTarget.toRankId)}?`
            : ""
        }
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMutation.mutateAsync(deleteTarget.id);
          }
        }}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
