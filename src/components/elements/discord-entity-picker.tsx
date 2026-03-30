"use client";

import { useState } from "react";
import { Shield, Hash, Users, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { cn } from "@/lib/utils";
import type { DiscordGuildRole, DiscordGuildChannel, DiscordGuildUser } from "@/types/discord-inventory";

interface DiscordEntityPickerProps {
  guildId: string;
  type: "role" | "channel" | "user";
  isOpen: boolean;
  onClose: () => void;
  onSelect: (entity: {
    id: string;
    name: string;
    type: "role" | "channel" | "user";
    displayMode: string;
  }) => void;
}

export function DiscordEntityPicker({
  guildId,
  type,
  isOpen,
  onClose,
  onSelect,
}: DiscordEntityPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState("name");
  const { data: inventory, isLoading } = useDiscordGuildInventory(guildId);

  const filteredRoles = inventory?.roles.filter((role) =>
    role.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const filteredChannels = inventory?.channels.filter((channel) =>
    channel.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const filteredUsers = inventory?.users.filter((user) =>
    (user.username?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (user.global_name?.toLowerCase() || "").includes(search.toLowerCase())
  ) ?? [];

  const handleSelect = () => {
    if (!selectedId) return;

    let name = "";
    if (type === "role") {
      name = filteredRoles.find((r) => r.id === selectedId)?.name || "";
    } else if (type === "channel") {
      name = filteredChannels.find((c) => c.id === selectedId)?.name || "";
    } else if (type === "user") {
      const user = filteredUsers.find((u) => u.id === selectedId);
      name = user?.global_name || user?.username || "";
    }

    onSelect({
      id: selectedId,
      name,
      type,
      displayMode,
    });
    setSelectedId(null);
    setSearch("");
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case "role":
        return Shield;
      case "channel":
        return Hash;
      case "user":
        return Users;
    }
  };

  const Icon = getIcon();
  const title = type === "role" ? "Select Role" : type === "channel" ? "Select Channel" : "Select User";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Choose a Discord {type} to create an element reference
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${type}s...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2">
            <Label>Display Mode</Label>
            <Select value={displayMode} onValueChange={setDisplayMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name only</SelectItem>
                {type !== "user" && <SelectItem value="mention">Discord mention</SelectItem>}
                {type === "user" && <SelectItem value="mention">@mention</SelectItem>}
                <SelectItem value="full">Full info</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-64 rounded-md border">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : type === "role" ? (
              <div className="p-2 space-y-1">
                {filteredRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedId(role.id)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors",
                      selectedId === role.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: `#${role.color.toString(16).padStart(6, "0")}` }}
                    />
                    <span className="flex-1 truncate">{role.name}</span>
                    {selectedId === role.id && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            ) : type === "channel" ? (
              <div className="p-2 space-y-1">
                {filteredChannels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedId(channel.id)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors",
                      selectedId === channel.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <Hash className="h-4 w-4" />
                    <span className="flex-1 truncate">#{channel.name}</span>
                    {selectedId === channel.id && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedId(user.id)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors",
                      selectedId === user.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                      {(user.global_name || user.username)?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">
                        {user.global_name || user.username}
                      </div>
                      {user.global_name && (
                        <div className="text-xs opacity-70 truncate">@{user.username}</div>
                      )}
                    </div>
                    {selectedId === user.id && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedId}>
            Create Element
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
