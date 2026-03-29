"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRanks, useDeleteRank, useReorderRanks } from "@/hooks/use-ranks";
import { useHasPermission } from "@/hooks/use-permissions";
import { PermissionGate } from "@/components/shared/permission-gate";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { RankCard } from "@/components/ranks/rank-card";
import { RankForm } from "@/components/ranks/rank-form";
import { RankTree } from "@/components/ranks/rank-tree";
import { PromotionPathEditor } from "@/components/ranks/promotion-path-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PERMISSION_KEYS } from "@/lib/constants";
import { Plus } from "lucide-react";
import type { RankWithDetails } from "@/types/rank";

export default function RanksPage() {
  const params = useParams<{ serverId: string }>();
  const serverId = params.serverId;

  const { data: ranks, isLoading } = useRanks(serverId);
  const deleteMutation = useDeleteRank(serverId);
  const reorderMutation = useReorderRanks(serverId);

  const { allowed: canManage } = useHasPermission(PERMISSION_KEYS.RANKS_MANAGE);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<RankWithDetails | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RankWithDetails | null>(null);

  // Sort ranks by level descending (highest authority at top)
  const sortedRanks = useMemo(
    () => [...(ranks ?? [])].sort((a, b) => b.level - a.level),
    [ranks]
  );

  function handleEdit(rank: RankWithDetails) {
    setEditingRank(rank);
    setFormOpen(true);
  }

  function handleCreate() {
    setEditingRank(null);
    setFormOpen(true);
  }

  function handleMoveUp(rank: RankWithDetails) {
    const index = sortedRanks.findIndex((r) => r.id === rank.id);
    if (index <= 0) return;

    const neighbor = sortedRanks[index - 1];
    reorderMutation.mutate({
      ranks: [
        { id: rank.id, level: neighbor.level },
        { id: neighbor.id, level: rank.level },
      ],
    });
  }

  function handleMoveDown(rank: RankWithDetails) {
    const index = sortedRanks.findIndex((r) => r.id === rank.id);
    if (index < 0 || index >= sortedRanks.length - 1) return;

    const neighbor = sortedRanks[index + 1];
    reorderMutation.mutate({
      ranks: [
        { id: rank.id, level: neighbor.level },
        { id: neighbor.id, level: rank.level },
      ],
    });
  }

  return (
    <PermissionGate permission={PERMISSION_KEYS.RANKS_VIEW}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ranks</h1>
            <p className="text-muted-foreground">
              {isLoading
                ? "Loading ranks..."
                : `${sortedRanks.length} ranks configured`}
            </p>
          </div>
          {canManage && (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Rank
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="hierarchy">
          <TabsList>
            <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
            <TabsTrigger value="paths">Promotion Paths</TabsTrigger>
          </TabsList>

          <TabsContent value="hierarchy" className="mt-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : sortedRanks.length === 0 ? (
              <div className="rounded-md border px-6 py-12 text-center">
                <p className="text-muted-foreground">
                  No ranks configured yet.
                </p>
                {canManage && (
                  <Button variant="link" onClick={handleCreate}>
                    Create your first rank
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                {/* Rank cards */}
                <div className="space-y-3">
                  {sortedRanks.map((rank, i) => (
                    <RankCard
                      key={rank.id}
                      rank={rank}
                      isFirst={i === 0}
                      isLast={i === sortedRanks.length - 1}
                      canManage={canManage}
                      onEdit={handleEdit}
                      onDelete={setDeleteTarget}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                    />
                  ))}
                </div>
                {/* Sidebar tree */}
                <div className="hidden lg:block">
                  <RankTree ranks={sortedRanks} />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="paths" className="mt-4">
            <PromotionPathEditor
              serverId={serverId}
              ranks={sortedRanks}
              canManage={canManage}
            />
          </TabsContent>
        </Tabs>

        {/* Rank form dialog */}
        <RankForm
          serverId={serverId}
          rank={editingRank}
          open={formOpen}
          onOpenChange={setFormOpen}
        />

        {/* Delete confirmation */}
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title={`Delete "${deleteTarget?.name}"?`}
          description={
            deleteTarget?.memberCount
              ? `This rank has ${deleteTarget.memberCount} members. They will be reassigned to the default rank.`
              : "This rank will be permanently deleted."
          }
          onConfirm={async () => {
            if (deleteTarget) {
              await deleteMutation.mutateAsync(deleteTarget.id);
            }
          }}
          confirmLabel="Delete Rank"
          variant="destructive"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </PermissionGate>
  );
}
