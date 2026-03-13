"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCreateRank, useUpdateRank, useRankPermissions, useSetRankPermissions } from "@/hooks/use-ranks";
import { PERMISSION_KEYS } from "@/lib/constants";
import { Shield } from "lucide-react";
import type { RankWithDetails } from "@/types/rank";

interface RankFormProps {
  factionId: string;
  rank?: RankWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Derive permission categories from PERMISSION_KEYS
function getPermissionCategories() {
  const categories = new Map<string, { key: string; label: string }[]>();
  for (const [label, key] of Object.entries(PERMISSION_KEYS)) {
    const category = key.split(".")[0].toUpperCase();
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push({
      key,
      label: label.replace(/_/g, " "),
    });
  }
  return categories;
}

export function RankForm({ factionId, rank, open, onOpenChange }: RankFormProps) {
  const isEdit = !!rank;
  const createMutation = useCreateRank(factionId);
  const updateMutation = useUpdateRank(factionId);
  const setPermissionsMutation = useSetRankPermissions(factionId);

  // Load current permissions when editing
  const { data: currentPermissions } = useRankPermissions(
    factionId,
    rank?.id ?? ""
  );

  // Form state
  const [name, setName] = useState("");
  const [level, setLevel] = useState(0);
  const [color, setColor] = useState("#6b7280");
  const [iconUrl, setIconUrl] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = useMemo(() => getPermissionCategories(), []);

  // Populate form when editing
  useEffect(() => {
    if (rank) {
      setName(rank.name);
      setLevel(rank.level);
      setColor(rank.color || "#6b7280");
      setIconUrl(rank.iconUrl || "");
      setIsDefault(rank.isDefault);
    } else {
      setName("");
      setLevel(0);
      setColor("#6b7280");
      setIconUrl("");
      setIsDefault(false);
      setSelectedPermissions(new Set());
    }
    setErrors({});
  }, [rank, open]);

  // Sync permissions when they load
  useEffect(() => {
    if (currentPermissions) {
      setSelectedPermissions(new Set(currentPermissions.map((p) => p.key)));
    }
  }, [currentPermissions]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (level < 0) newErrors.level = "Level must be 0 or greater";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function togglePermission(key: string) {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleCategory(category: string) {
    const perms = categories.get(category);
    if (!perms) return;
    const allSelected = perms.every((p) => selectedPermissions.has(p.key));
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      for (const p of perms) {
        if (allSelected) next.delete(p.key);
        else next.add(p.key);
      }
      return next;
    });
  }

  async function handleSubmit() {
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      level,
      color: color !== "#6b7280" ? color : undefined,
      iconUrl: iconUrl.trim() || undefined,
      isDefault,
    };

    try {
      if (isEdit && rank) {
        await updateMutation.mutateAsync({ rankId: rank.id, ...payload });
        await setPermissionsMutation.mutateAsync({
          rankId: rank.id,
          permissionIds: Array.from(selectedPermissions),
        });
      } else {
        const created = await createMutation.mutateAsync(payload);
        if (created?.id) {
          await setPermissionsMutation.mutateAsync({
            rankId: created.id,
            permissionIds: Array.from(selectedPermissions),
          });
        }
      }
      onOpenChange(false);
    } catch {
      // Error handled by API client interceptor
    }
  }

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    setPermissionsMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Rank" : "Create Rank"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the rank settings and permissions."
              : "Configure a new rank for your faction."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-4">
            {/* Preview */}
            <div className="flex items-center gap-3 rounded-md border p-3 bg-muted/30">
              <div
                className="flex h-8 w-8 items-center justify-center rounded"
                style={{ backgroundColor: `${color}20` }}
              >
                {iconUrl ? (
                  <img
                    src={iconUrl}
                    alt="preview"
                    className="h-6 w-6 rounded object-cover"
                  />
                ) : (
                  <Shield className="h-4 w-4" style={{ color }} />
                )}
              </div>
              <Badge variant="outline" style={{ borderColor: color, color }}>
                {name || "Rank Name"}
              </Badge>
              <span className="text-xs text-muted-foreground">Level {level}</span>
            </div>

            {/* Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rank-name">Name *</Label>
                <Input
                  id="rank-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sergeant"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rank-level">Level *</Label>
                <Input
                  id="rank-level"
                  type="number"
                  min={0}
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                />
                {errors.level && (
                  <p className="text-xs text-destructive">{errors.level}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rank-color">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="rank-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded border border-input bg-background p-1"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1"
                    maxLength={7}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rank-icon">Icon URL</Label>
                <Input
                  id="rank-icon"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="rank-default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
              <Label htmlFor="rank-default">Default rank for new members</Label>
            </div>

            <Separator />

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Permissions</h3>
              {Array.from(categories.entries()).map(([category, perms]) => {
                const allSelected = perms.every((p) =>
                  selectedPermissions.has(p.key)
                );
                const someSelected =
                  !allSelected &&
                  perms.some((p) => selectedPermissions.has(p.key));

                return (
                  <div key={category} className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        onChange={() => toggleCategory(category)}
                        className="h-4 w-4 rounded border-input"
                      />
                      <span className="text-sm font-medium capitalize">
                        {category.toLowerCase()}
                      </span>
                    </label>
                    <div className="ml-6 grid gap-1 sm:grid-cols-2">
                      {perms.map((perm) => (
                        <label
                          key={perm.key}
                          className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.has(perm.key)}
                            onChange={() => togglePermission(perm.key)}
                            className="h-3.5 w-3.5 rounded border-input"
                          />
                          {perm.label}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Rank"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
