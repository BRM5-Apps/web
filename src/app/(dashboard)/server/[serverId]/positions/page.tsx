"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { usePositions, useCreatePosition, useUpdatePosition, useDeletePosition } from "@/hooks/use-positions";
import { useHasPermission } from "@/hooks/use-permissions";
import { PermissionGate } from "@/components/shared/permission-gate";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PositionCard } from "@/components/positions/position-card";
import { PositionForm } from "@/components/positions/position-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PERMISSION_KEYS } from "@/lib/constants";
import { Plus } from "lucide-react";
import type { PositionWithHolders } from "@/types/position";

export default function PositionsPage() {
  const params = useParams<{ serverId: string }>();
  const serverId = params.serverId;

  const { data: positions, isLoading } = usePositions(serverId);
  const createMutation = useCreatePosition(serverId);
  const updateMutation = useUpdatePosition(serverId);
  const deleteMutation = useDeletePosition(serverId);

  const { allowed: canManage } = useHasPermission(PERMISSION_KEYS.MEMBERS_MANAGE);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionWithHolders | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PositionWithHolders | null>(null);

  // Sort positions by order
  const sortedPositions = positions
    ? [...positions].sort((a, b) => a.order - b.order)
    : [];

  function handleEdit(position: PositionWithHolders) {
    setEditingPosition(position);
    setFormOpen(true);
  }

  function handleCreate() {
    setEditingPosition(null);
    setFormOpen(true);
  }

  return (
    <PermissionGate permission={PERMISSION_KEYS.MEMBERS_VIEW}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Positions</h1>
            <p className="text-muted-foreground">
              {isLoading
                ? "Loading positions..."
                : `${sortedPositions.length} positions configured`}
            </p>
          </div>
          {canManage && (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Position
            </Button>
          )}
        </div>

        {/* Position list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : sortedPositions.length === 0 ? (
          <div className="rounded-md border px-6 py-12 text-center">
            <p className="text-muted-foreground">
              No positions configured yet.
            </p>
            {canManage && (
              <Button variant="link" onClick={handleCreate}>
                Create your first position
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedPositions.map((position) => (
              <PositionCard
                key={position.id}
                position={position}
                serverId={serverId}
                canManage={canManage}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}

        {/* Position form dialog */}
        <PositionForm
          serverId={serverId}
          position={editingPosition}
          open={formOpen}
          onOpenChange={setFormOpen}
        />

        {/* Delete confirmation */}
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title={`Delete "${deleteTarget?.name}"?`}
          description={
            deleteTarget?.holders && deleteTarget.holders.length > 0
              ? `This position has ${deleteTarget.holders.length} member(s) assigned. They will be unassigned.`
              : "This position will be permanently deleted."
          }
          onConfirm={async () => {
            if (deleteTarget) {
              await deleteMutation.mutateAsync(deleteTarget.id);
            }
          }}
          confirmLabel="Delete Position"
          variant="destructive"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </PermissionGate>
  );
}