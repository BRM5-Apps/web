"use client";

import { useState } from "react";
import { ShieldAlert, Clock, Users, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DiscordAuditPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (config: {
    actionTypes: number[];
    timeRangeHours: number;
    name: string;
  }) => void;
}

// Common Discord audit log action types
const ACTION_TYPES = [
  { value: 20, label: "Member Kick", category: "Moderation" },
  { value: 22, label: "Member Ban", category: "Moderation" },
  { value: 23, label: "Member Unban", category: "Moderation" },
  { value: 24, label: "Member Update", category: "Moderation" },
  { value: 25, label: "Member Role Update", category: "Moderation" },
  { value: 10, label: "Channel Create", category: "Channel" },
  { value: 11, label: "Channel Update", category: "Channel" },
  { value: 12, label: "Channel Delete", category: "Channel" },
  { value: 30, label: "Role Create", category: "Role" },
  { value: 31, label: "Role Update", category: "Role" },
  { value: 32, label: "Role Delete", category: "Role" },
  { value: 72, label: "Message Delete", category: "Message" },
  { value: 73, label: "Bulk Message Delete", category: "Message" },
];

const TIME_RANGES = [
  { value: 0, label: "All time" },
  { value: 1, label: "Last hour" },
  { value: 24, label: "Last 24 hours" },
  { value: 168, label: "Last 7 days" },
  { value: 720, label: "Last 30 days" },
];

export function DiscordAuditPicker({ isOpen, onClose, onSelect }: DiscordAuditPickerProps) {
  const [selectedActions, setSelectedActions] = useState<number[]>([20]);
  const [timeRangeHours, setTimeRangeHours] = useState(0);
  const [name, setName] = useState("");

  const handleToggleAction = (actionType: number) => {
    setSelectedActions((prev) =>
      prev.includes(actionType)
        ? prev.filter((a) => a !== actionType)
        : [...prev, actionType]
    );
  };

  const handleSelect = () => {
    if (selectedActions.length === 0 || !name) return;

    onSelect({
      actionTypes: selectedActions,
      timeRangeHours,
      name,
    });

    // Reset
    setSelectedActions([20]);
    setTimeRangeHours(0);
    setName("");
    onClose();
  };

  // Group action types by category
  const groupedActions = ACTION_TYPES.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, typeof ACTION_TYPES>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Create Audit Event Counter
          </DialogTitle>
          <DialogDescription>
            Track Discord audit log events (kicks, bans, message deletions, etc.)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Element Name</Label>
            <Input
              placeholder="e.g., Kick Count"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Time Range</Label>
            <Select
              value={timeRangeHours.toString()}
              onValueChange={(v) => setTimeRangeHours(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value.toString()}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Events to Count</Label>
            <div className="rounded-md border p-4 space-y-4 max-h-64 overflow-y-auto">
              {Object.entries(groupedActions).map(([category, actions]) => (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                    {category}
                  </h4>
                  <div className="space-y-1">
                    {actions.map((action) => {
                      const isSelected = selectedActions.includes(action.value);
                      return (
                        <button
                          key={action.value}
                          onClick={() => handleToggleAction(action.value)}
                          className={cn(
                            "w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center",
                            isSelected ? "bg-primary-foreground border-primary-foreground" : "border-muted-foreground"
                          )}>
                            {isSelected && <Check className="h-3 w-3 text-primary" />}
                          </div>
                          <span className="flex-1">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={selectedActions.length === 0 || !name}
          >
            Create Counter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
