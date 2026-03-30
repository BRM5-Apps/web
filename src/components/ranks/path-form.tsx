"use client";

import { useState } from "react";
import { useCreatePromotionPath, useDeletePromotionPath } from "@/hooks/use-promotion-paths";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RankWithDetails } from "@/types/rank";

interface PathFormProps {
  serverId: string;
  branchId?: string;
  ranks: RankWithDetails[];
  fromRankId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PathForm({
  serverId,
  ranks,
  fromRankId,
  open,
  onOpenChange,
}: PathFormProps) {
  const createMutation = useCreatePromotionPath(serverId);

  const [fromRank, setFromRank] = useState(fromRankId ?? "");
  const [toRank, setToRank] = useState("");
  const [requiredPoints, setRequiredPoints] = useState<number | "">("");
  const [requiredEvents, setRequiredEvents] = useState<number | "">("");
  const [requiredDays, setRequiredDays] = useState<number | "">("");
  const [autoPromote, setAutoPromote] = useState(false);

  // Reset form when dialog opens
  useState(() => {
    if (open) {
      setFromRank(fromRankId ?? "");
      setToRank("");
      setRequiredPoints("");
      setRequiredEvents("");
      setRequiredDays("");
      setAutoPromote(false);
    }
  });

  // Filter "to" ranks to only show higher levels than "from"
  const fromRankData = ranks.find((r) => r.id === fromRank);
  const toRankOptions = fromRankData
    ? ranks.filter((r) => r.level > fromRankData.level)
    : ranks;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fromRank || !toRank) return;

    await createMutation.mutateAsync({
      fromRankId: fromRank,
      toRankId: toRank,
      requiredPoints: requiredPoints !== "" ? requiredPoints : undefined,
      requiredEvents: requiredEvents !== "" ? requiredEvents : undefined,
      requiredDays: requiredDays !== "" ? requiredDays : undefined,
      autoPromote,
    });

    onOpenChange(false);
    // Reset form
    setFromRank(fromRankId ?? "");
    setToRank("");
    setRequiredPoints("");
    setRequiredEvents("");
    setRequiredDays("");
    setAutoPromote(false);
  }

  const isLoading = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Promotion Path</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* From Rank */}
          <div className="space-y-2">
            <Label htmlFor="fromRank">From Rank</Label>
            <Select value={fromRank} onValueChange={setFromRank}>
              <SelectTrigger id="fromRank">
                <SelectValue placeholder="Select starting rank" />
              </SelectTrigger>
              <SelectContent>
                {ranks
                  .sort((a, b) => a.level - b.level)
                  .map((rank) => (
                    <SelectItem key={rank.id} value={rank.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: rank.color }}
                        />
                        {rank.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* To Rank */}
          <div className="space-y-2">
            <Label htmlFor="toRank">To Rank</Label>
            <Select
              value={toRank}
              onValueChange={setToRank}
              disabled={!fromRank}
            >
              <SelectTrigger id="toRank">
                <SelectValue placeholder="Select target rank" />
              </SelectTrigger>
              <SelectContent>
                {toRankOptions
                  .sort((a, b) => a.level - b.level)
                  .map((rank) => (
                    <SelectItem key={rank.id} value={rank.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: rank.color }}
                        />
                        {rank.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {fromRank && toRankOptions.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No higher ranks available to promote to
              </p>
            )}
          </div>

          {/* Requirements */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min={0}
                value={requiredPoints}
                onChange={(e) =>
                  setRequiredPoints(e.target.value ? Number(e.target.value) : "")
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="events">Events</Label>
              <Input
                id="events"
                type="number"
                min={0}
                value={requiredEvents}
                onChange={(e) =>
                  setRequiredEvents(e.target.value ? Number(e.target.value) : "")
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Days</Label>
              <Input
                id="days"
                type="number"
                min={0}
                value={requiredDays}
                onChange={(e) =>
                  setRequiredDays(e.target.value ? Number(e.target.value) : "")
                }
                placeholder="0"
              />
            </div>
          </div>

          {/* Auto promote */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoPromote">Auto Promote</Label>
              <p className="text-xs text-muted-foreground">
                Automatically promote when requirements are met
              </p>
            </div>
            <Switch
              id="autoPromote"
              checked={autoPromote}
              onCheckedChange={setAutoPromote}
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
            <Button
              type="submit"
              disabled={isLoading || !fromRank || !toRank}
            >
              Add Path
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}