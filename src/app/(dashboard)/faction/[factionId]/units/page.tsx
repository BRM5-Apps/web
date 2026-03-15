"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { MoreHorizontal, Plus, Trash2, AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useUnits, useCreateUnit, useDeleteUnit } from "@/hooks/use-units";
import type { Unit } from "@/types/unit";

export default function UnitsPage() {
  const { factionId } = useParams<{ factionId: string }>();

  const { data: units, isLoading, isError, error, refetch } = useUnits(factionId);
  const createUnit = useCreateUnit(factionId);
  const deleteUnit = useDeleteUnit(factionId);

  const [open, setOpen] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [unitDescription, setUnitDescription] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);

  function handleCreate() {
    if (!unitName.trim()) return;
    createUnit.mutate(
      { name: unitName.trim(), description: unitDescription.trim() || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          setUnitName("");
          setUnitDescription("");
        },
      }
    );
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteUnit.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    });
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Units</h1>
          <p className="text-muted-foreground">
            Manage your faction&apos;s unit structure.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Unit
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div>
            <p className="font-medium">Failed to load units</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && units?.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-muted-foreground">
            No units created yet. Create your first unit to organize your members.
          </p>
        </div>
      )}

      {/* Units grid */}
      {!isLoading && !isError && units && units.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => (
            <Card key={unit.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  {unit.name}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Actions for ${unit.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteTarget(unit)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                {unit.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {unit.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Created {format(new Date(unit.createdAt), "MMM d, yyyy")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Unit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="unit-name">Unit Name</Label>
              <Input
                id="unit-name"
                placeholder="e.g. Alpha Squad"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit-description">Description (optional)</Label>
              <textarea
                id="unit-description"
                placeholder="Describe what this unit does..."
                value={unitDescription}
                onChange={(e) => setUnitDescription(e.target.value)}
                rows={3}
                className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!unitName.trim() || createUnit.isPending}
            >
              {createUnit.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Unit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteUnit.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUnit.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
