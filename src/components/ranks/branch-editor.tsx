"use client";

import { useState } from "react";
import { useBranches, useCreateBranch, useDeleteBranch } from "@/hooks/use-branches";
import { useRanks } from "@/hooks/use-ranks";
import { useHasPermission } from "@/hooks/use-permissions";
import { PermissionGate } from "@/components/shared/permission-gate";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { BranchCard } from "./branch-card";
import { BranchForm } from "./branch-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PERMISSION_KEYS } from "@/lib/constants";
import { Plus } from "lucide-react";
import type { RankBranch } from "@/types/branch";

interface BranchEditorProps {
  serverId: string;
}

export function BranchEditor({ serverId }: BranchEditorProps) {
  const { data: branches, isLoading: branchesLoading } = useBranches(serverId);
  const { data: ranks, isLoading: ranksLoading } = useRanks(serverId);
  const createMutation = useCreateBranch(serverId);
  const deleteMutation = useDeleteBranch(serverId);

  const { allowed: canManage } = useHasPermission(PERMISSION_KEYS.RANKS_MANAGE);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<RankBranch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RankBranch | null>(null);

  const isLoading = branchesLoading || ranksLoading;

  function handleCreate() {
    setEditingBranch(null);
    setFormOpen(true);
  }

  function handleEdit(branch: RankBranch) {
    setEditingBranch(branch);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  }

  // Sort branches by order
  const sortedBranches = branches
    ? [...branches].sort((a, b) => a.order - b.order)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Rank Branches</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading..."
              : `${sortedBranches.length} branch${sortedBranches.length !== 1 ? "es" : ""} configured`}
          </p>
        </div>
        {canManage && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Branch
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : sortedBranches.length === 0 ? (
        <div className="rounded-md border px-6 py-12 text-center">
          <p className="text-muted-foreground">
            No branches configured yet.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Branches allow you to create multiple promotion paths from a single rank.
          </p>
          {canManage && (
            <Button variant="link" onClick={handleCreate}>
              Create your first branch
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBranches.map((branch) => (
            <BranchCard
              key={branch.id}
              serverId={serverId}
              branch={branch}
              ranks={ranks ?? []}
              canManage={canManage}
              onEdit={() => handleEdit(branch)}
              onDelete={() => setDeleteTarget(branch)}
            />
          ))}
        </div>
      )}

      {/* Branch form dialog */}
      <BranchForm
        serverId={serverId}
        branch={editingBranch}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This branch and all its promotion paths will be permanently deleted. Members on this branch will retain their current rank."
        onConfirm={handleDelete}
        confirmLabel="Delete Branch"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}