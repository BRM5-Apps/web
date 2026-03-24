"use client";

import { useState } from "react";
import { BarChart3, Users, Hash, Shield } from "lucide-react";
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
import { useDiscordGuildInventory } from "@/hooks/use-discord-guild-inventory";

interface ServerStatPickerProps {
  guildId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (config: {
    statType: string;
    discordId?: string;
    name: string;
  }) => void;
}

const STAT_TYPES = [
  { value: "channel_count", label: "Channel Count", icon: Hash, needsId: false },
  { value: "role_count", label: "Role Count", icon: Shield, needsId: false },
  { value: "user_count", label: "User Count", icon: Users, needsId: false },
  { value: "role_holders", label: "Role Holders Count", icon: Shield, needsId: true },
];

export function ServerStatPicker({ guildId, isOpen, onClose, onSelect }: ServerStatPickerProps) {
  const [statType, setStatType] = useState("channel_count");
  const [discordId, setDiscordId] = useState("");
  const [name, setName] = useState("");
  const { data: inventory } = useDiscordGuildInventory(guildId);

  const selectedStatType = STAT_TYPES.find((t) => t.value === statType);
  const needsDiscordId = selectedStatType?.needsId ?? false;

  const handleSelect = () => {
    if (needsDiscordId && !discordId) return;
    if (!name) return;

    onSelect({
      statType,
      discordId: needsDiscordId ? discordId : undefined,
      name,
    });

    // Reset
    setStatType("channel_count");
    setDiscordId("");
    setName("");
    onClose();
  };

  // Auto-generate name based on selection
  const handleStatTypeChange = (value: string) => {
    setStatType(value);
    const statLabel = STAT_TYPES.find((t) => t.value === value)?.label || "";
    setName(statLabel);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Create Server Stat Element
          </DialogTitle>
          <DialogDescription>
            Track server statistics like member count, role holders, etc.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Stat Type</Label>
            <Select value={statType} onValueChange={handleStatTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsDiscordId && (
            <div className="space-y-2">
              <Label>Select Role</Label>
              <Select value={discordId} onValueChange={setDiscordId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role..." />
                </SelectTrigger>
                <SelectContent>
                  {inventory?.roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: `#${role.color
                              .toString(16)
                              .padStart(6, "0")}`,
                          }}
                        />
                        {role.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Element Name</Label>
            <Input
              placeholder="e.g., Total Channels"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!name || (needsDiscordId && !discordId)}
          >
            Create Element
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
