"use client";

import { useState, useEffect } from "react";
import { useCreateBranch, useUpdateBranch } from "@/hooks/use-branches";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { RankBranch } from "@/types/branch";

interface BranchFormProps {
  serverId: string;
  branch: RankBranch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
];

export function BranchForm({
  serverId,
  branch,
  open,
  onOpenChange,
}: BranchFormProps) {
  const createMutation = useCreateBranch(serverId);
  const updateMutation = useUpdateBranch(serverId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isExclusive, setIsExclusive] = useState(true);
  const [color, setColor] = useState(COLORS[0]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (branch) {
        setName(branch.name);
        setDescription(branch.description ?? "");
        setIsExclusive(branch.isExclusive);
        setColor(branch.color);
      } else {
        setName("");
        setDescription("");
        setIsExclusive(true);
        setColor(COLORS[0]);
      }
    }
  }, [open, branch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return;

    if (branch) {
      await updateMutation.mutateAsync({
        branchId: branch.id,
        name,
        description: description || undefined,
        isExclusive,
        color,
      });
    } else {
      await createMutation.mutateAsync({
        name,
        description: description || undefined,
        isExclusive,
        color,
      });
    }

    onOpenChange(false);
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {branch ? `Edit ${branch.name}` : "Create Branch"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Officer Track, Specialist Path"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this promotion path..."
              rows={2}
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full transition ${
                    color === c ? "ring-2 ring-offset-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Exclusive toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="exclusive">Exclusive Path</Label>
              <p className="text-xs text-muted-foreground">
                Members can only progress through one path in this branch at a
                time
              </p>
            </div>
            <Switch
              id="exclusive"
              checked={isExclusive}
              onCheckedChange={setIsExclusive}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {branch ? "Save Changes" : "Create Branch"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}