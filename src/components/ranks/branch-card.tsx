"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUpdateBranchPathOrder } from "@/hooks/use-branches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { GripVertical, Edit, Trash2, Plus } from "lucide-react";
import type { RankBranch, BranchPath } from "@/types/branch";
import type { RankWithDetails } from "@/types/rank";

interface BranchCardProps {
  serverId: string;
  branch: RankBranch;
  ranks: RankWithDetails[];
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

interface SortablePathItemProps {
  path: BranchPath;
  ranks: RankWithDetails[];
  canManage: boolean;
}

function SortablePathItem({ path, ranks, canManage }: SortablePathItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: path.id });

  const fromRank = ranks.find((r) => r.id === path.fromRankId);
  const toRank = ranks.find((r) => r.id === path.toRankId);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2"
    >
      {canManage && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
      <div className="flex items-center gap-2 flex-1">
        <Badge
          variant="outline"
          style={{
            borderColor: fromRank?.color || "#6b7280",
            color: fromRank?.color || "#6b7280",
          }}
        >
          {fromRank?.name ?? "Unknown"}
        </Badge>
        <span className="text-muted-foreground">→</span>
        <Badge
          variant="outline"
          style={{
            borderColor: toRank?.color || "#6b7280",
            color: toRank?.color || "#6b7280",
          }}
        >
          {toRank?.name ?? "Unknown"}
        </Badge>
      </div>
      {(path.requiredPoints || path.requiredEvents || path.requiredDays) && (
        <div className="text-xs text-muted-foreground">
          {path.requiredPoints && <span>{path.requiredPoints} pts</span>}
          {path.requiredEvents && (
            <span className="ml-2">{path.requiredEvents} events</span>
          )}
          {path.requiredDays && (
            <span className="ml-2">{path.requiredDays} days</span>
          )}
        </div>
      )}
      {path.autoPromote && (
        <Badge variant="secondary" className="text-xs">
          Auto
        </Badge>
      )}
    </div>
  );
}

export function BranchCard({
  serverId,
  branch,
  ranks,
  canManage,
  onEdit,
  onDelete,
}: BranchCardProps) {
  const [showDetails, setShowDetails] = useState(true);
  const updatePathOrder = useUpdateBranchPathOrder(serverId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort paths by order
  const sortedPaths = [...branch.paths].sort((a, b) => a.order - b.order);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedPaths.findIndex((p) => p.id === active.id);
      const newIndex = sortedPaths.findIndex((p) => p.id === over.id);

      const reorderedPaths = arrayMove(sortedPaths, oldIndex, newIndex);

      // Update order on server
      updatePathOrder.mutate({
        branchId: branch.id,
        payload: {
          paths: reorderedPaths.map((p, index) => ({
            id: p.id,
            fromRankId: p.fromRankId,
            toRankId: p.toRankId,
            order: index,
            requiredPoints: p.requiredPoints,
            requiredEvents: p.requiredEvents,
            requiredDays: p.requiredDays,
            autoPromote: p.autoPromote,
          })),
        },
      });
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: branch.color }}
            />
            <CardTitle className="text-lg">{branch.name}</CardTitle>
            {branch.isExclusive && (
              <Badge variant="secondary" className="text-xs">
                Exclusive
              </Badge>
            )}
            {branch.discordRoleId && (
              <Badge variant="outline" className="text-xs">
                Discord Role Linked
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <>
                <Button variant="ghost" size="icon" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <div className="flex items-center gap-2 ml-2">
              <Label htmlFor={`show-${branch.id}`} className="text-xs">
                Show paths
              </Label>
              <Switch
                id={`show-${branch.id}`}
                checked={showDetails}
                onCheckedChange={setShowDetails}
              />
            </div>
          </div>
        </div>
        {branch.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {branch.description}
          </p>
        )}
      </CardHeader>

      {showDetails && (
        <CardContent className="pt-0">
          {branch.paths.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
              No promotion paths defined yet.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedPaths.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sortedPaths.map((path) => (
                    <SortablePathItem
                      key={path.id}
                      path={path}
                      ranks={ranks}
                      canManage={canManage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      )}
    </Card>
  );
}