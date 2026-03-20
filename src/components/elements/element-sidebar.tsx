"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  GripVertical,
  Users,
  Shield,
  Hash,
  MoreHorizontal,
  Copy,
  Check,
  MousePointerClick,
  Variable,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useServer } from "@/hooks/use-server";
import { useDiscordGuildInventory } from "@/hooks/use-discord-guild-inventory";
import { useElements } from "@/hooks/use-elements";
import { useCustomVariables, generateVariableKey } from "@/hooks/use-custom-variables";
import { useElementInsertion } from "./element-insertion-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ElementCatalogItem } from "@/types/element";
import type { DiscordGuildRole, DiscordGuildUser, DiscordGuildChannel } from "@/types/discord-inventory";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

// Role format options
type RoleFormat = "mention" | "count" | "name" | "id";

interface RoleElement extends ElementCatalogItem {
  roleData: DiscordGuildRole;
}

// User format options
type UserFormat = "mention" | "id" | "username" | "global_name" | "avatar" | "tag";

interface UserElement extends ElementCatalogItem {
  userData: DiscordGuildUser;
}

// Channel format options
type ChannelFormat = "mention" | "name" | "id";

interface ChannelElement extends ElementCatalogItem {
  channelData: DiscordGuildChannel;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  system: Shield,
  user: Users,
  server: Shield,
  rank: Shield,
  module_fields: Hash,
  custom_counters: Hash,
  custom: Hash,
  custom_variables: Hash,
  discord_roles: Shield,
  discord_channels: Hash,
  discord_users: Users,
};

const CATEGORY_LABELS: Record<string, string> = {
  system: "System",
  user: "User Data",
  server: "Server Stats",
  rank: "Rank",
  module_fields: "Module Fields",
  custom_counters: "Custom Counters",
  custom: "Custom",
  custom_variables: "Custom Variables",
  discord_roles: "Discord Roles",
  discord_channels: "Discord Channels",
  discord_users: "Discord Users",
};

const DEFAULT_CATEGORY_ORDER = [
  "system",
  "user",
  "server",
  "rank",
  "module_fields",
  "custom_counters",
  "custom",
  "custom_variables",
  "discord_roles",
  "discord_channels",
  "discord_users",
];

const STORAGE_KEY_ORDER = "element-sidebar:category-order";
const STORAGE_KEY_EXPANDED = "element-sidebar:expanded-categories";

function useLocalStorageState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [key, state]);

  return [state, setState];
}

export function ElementSidebar({
  serverId,
  className,
}: {
  serverId: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreateVarOpen, setIsCreateVarOpen] = useState(false);
  const [newVarName, setNewVarName] = useState("");
  const [newVarDescription, setNewVarDescription] = useState("");
  const [newVarDefault, setNewVarDefault] = useState("");
  const [categoryOrder, setCategoryOrder] = useLocalStorageState<string[]>(STORAGE_KEY_ORDER, DEFAULT_CATEGORY_ORDER);
  const [expandedCategoriesRaw, setExpandedCategories] = useLocalStorageState<unknown>(
    STORAGE_KEY_EXPANDED,
    []
  );
  // Migrate from old Set format to array format
  const expandedCategories = Array.isArray(expandedCategoriesRaw)
    ? expandedCategoriesRaw
    : [];

  const { data, isLoading } = useElements(serverId);
  const server = useServer(serverId);
  const guildInventory = useDiscordGuildInventory(server.data?.discordGuildId);
  const { insertToken } = useElementInsertion();
  const customVars = useCustomVariables(serverId);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev: unknown) => {
      const arr = Array.isArray(prev) ? prev : [];
      if (arr.includes(category)) {
        return arr.filter((c: string) => c !== category);
      } else {
        return [...arr, category];
      }
    });
  }, [setExpandedCategories]);

  const moveCategory = useCallback((index: number, direction: -1 | 1) => {
    setCategoryOrder((prev) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
  }, [setCategoryOrder]);

  // Create role elements with format options
  const roleElements = useMemo((): RoleElement[] => {
    return (guildInventory.data?.roles ?? []).map((role) => ({
      id: `discord-role-${role.id}`,
      name: role.name,
      variable_key: `discord_role_${role.id}`,
      element_type: "STATIC" as const,
      description: role.managed ? "Managed Discord role" : "Discord server role",
      category: "discord_roles",
      source: "discord",
      insertions: [`<@&${role.id}>`],
      config: { discord_id: role.id, discord_kind: "role", formats: ["mention", "count", "name", "id"] },
      roleData: role,
    }));
  }, [guildInventory.data?.roles]);

  // Create channel elements with format options
  const channelElements = useMemo((): ChannelElement[] => {
    return (guildInventory.data?.channels ?? []).map((channel) => ({
      id: `discord-channel-${channel.id}`,
      name: channel.name,
      variable_key: `discord_channel_${channel.id}`,
      element_type: "STATIC" as const,
      description: `Discord channel`,
      category: "discord_channels",
      source: "discord",
      insertions: [`<#${channel.id}>`],
      config: { discord_id: channel.id, discord_kind: "channel", channel_type: channel.type, formats: ["mention", "name", "id"] },
      channelData: channel,
    }));
  }, [guildInventory.data?.channels]);

  // Create user elements with format options
  const userElements = useMemo((): UserElement[] => {
    return (guildInventory.data?.users ?? []).map((user) => ({
      id: `discord-user-${user.id}`,
      name: user.global_name || user.username,
      variable_key: `discord_user_${user.id}`,
      element_type: "STATIC" as const,
      description: user.bot ? `Bot user @${user.username}` : `Discord user @${user.username}`,
      category: "discord_users",
      source: "discord",
      insertions: [`<@${user.id}>`],
      config: { discord_id: user.id, discord_kind: "user", username: user.username, formats: ["mention", "id", "username", "global_name", "tag", "avatar"] },
      userData: user,
    }));
  }, [guildInventory.data?.users]);

  const allItems = useMemo<ElementCatalogItem[]>(() => {
    return [...(data ?? []), ...roleElements, ...channelElements, ...userElements, ...customVars.elementItems];
  }, [data, roleElements, channelElements, userElements, customVars.elementItems]);

  const grouped = useMemo(() => {
    const items = allItems.filter((item) => {
      const haystack = `${item.name} ${item.variable_key} ${item.description}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });

    const groups = items.reduce<Record<string, ElementCatalogItem[]>>((acc, item) => {
      const key = item.category || "custom";
      acc[key] ??= [];
      acc[key].push(item);
      return acc;
    }, {});

    // Sort categories according to user preference
    return categoryOrder
      .filter((cat) => groups[cat] && groups[cat].length > 0)
      .map((category) => ({
        category,
        items: groups[category],
      }));
  }, [allItems, query, categoryOrder]);

  async function copyToken(token: string, id: string) {
    await navigator.clipboard.writeText(token);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 1500);
  }

  function insertAtCursor(token: string) {
    if (!insertToken(token)) {
      void copyToken(token, "fallback");
      toast.info("No active text field found. Copied to clipboard instead.");
    }
  }

  function handleCreateVariable(e: React.FormEvent) {
    e.preventDefault();
    if (!newVarName.trim()) return;

    customVars.createVariable(newVarName.trim(), newVarDescription.trim(), newVarDefault.trim());
    setNewVarName("");
    setNewVarDescription("");
    setNewVarDefault("");
    setIsCreateVarOpen(false);
    toast.success("Custom variable created");
  }

  // Get insertion value for role based on format
  function getRoleInsertion(role: RoleElement, format: RoleFormat): { value: string; label: string } {
    switch (format) {
      case "mention":
        return { value: `<@&${role.roleData.id}>`, label: "Mention" };
      case "count":
        return { value: `{{role_count:${role.roleData.id}}}`, label: "Member Count" };
      case "name":
        return { value: role.roleData.name, label: "Name" };
      case "id":
        return { value: role.roleData.id, label: "ID" };
      default:
        return { value: `<@&${role.roleData.id}>`, label: "Mention" };
    }
  }

  // Get insertion value for user based on format
  function getUserInsertion(user: UserElement, format: UserFormat): { value: string; label: string } {
    switch (format) {
      case "mention":
        return { value: `<@${user.userData.id}>`, label: "Mention" };
      case "id":
        return { value: user.userData.id, label: "ID" };
      case "username":
        return { value: user.userData.username, label: "Username" };
      case "global_name":
        return { value: user.userData.global_name || user.userData.username, label: "Display Name" };
      case "tag":
        return { value: `@${user.userData.username}`, label: "Tag" };
      case "avatar":
        return { value: user.userData.avatar || "", label: "Avatar URL" };
      default:
        return { value: `<@${user.userData.id}>`, label: "Mention" };
    }
  }

  // Get insertion value for channel based on format
  function getChannelInsertion(channel: ChannelElement, format: ChannelFormat): { value: string; label: string } {
    switch (format) {
      case "mention":
        return { value: `<#${channel.channelData.id}>`, label: "Mention" };
      case "name":
        return { value: channel.channelData.name, label: "Name" };
      case "id":
        return { value: channel.channelData.id, label: "ID" };
      default:
        return { value: `<#${channel.channelData.id}>`, label: "Mention" };
    }
  }

  return (
    <aside
      className={cn(
        "rounded-lg border border-border bg-card transition-all flex flex-col",
        collapsed ? "w-[52px]" : "w-full lg:w-[340px]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-3">
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Elements</p>
            <p className="text-xs text-muted-foreground truncate">
              Drag or click to insert tokens
            </p>
          </div>
        )}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand element sidebar" : "Collapse element sidebar"}
        >
          {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {!collapsed && (
        <>
          <div className="border-b border-border px-3 py-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search elements..."
                className="pl-8 h-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {(isLoading || server.isLoading || guildInventory.isLoading) && (
                <div className="py-8 text-center">
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading elements...</p>
                </div>
              )}

              {!isLoading && !server.isLoading && !guildInventory.isLoading && grouped.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No elements match this search.</p>
                </div>
              )}

              {grouped.map(({ category, items }, categoryIndex) => {
                const isExpanded = expandedCategories.includes(category);
                const Icon = CATEGORY_ICONS[category] || Hash;

                return (
                  <div key={category} className="rounded-md border border-border/50 overflow-hidden">
                    <div
                      className={cn(
                        "flex items-center gap-2 px-2 py-2 bg-muted/30",
                        "hover:bg-muted/50 transition-colors"
                      )}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => toggleCategory(category)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </Button>

                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-xs font-semibold uppercase tracking-wide">
                        {CATEGORY_LABELS[category] ?? category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">({items.length})</span>

                      {/* Add Variable button for custom_variables category */}
                      {category === "custom_variables" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCreateVarOpen(true);
                          }}
                          title="Create custom variable"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      {/* Reorder buttons */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={categoryIndex === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveCategory(categoryIndex, -1);
                          }}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={categoryIndex === grouped.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveCategory(categoryIndex, 1);
                          }}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-1.5 space-y-1 bg-background">
                        {items.map((item) => {
                          const isRole = item.category === "discord_roles" && "roleData" in item;
                          const isUser = item.category === "discord_users" && "userData" in item;
                          const isChannel = item.category === "discord_channels" && "channelData" in item;

                          return (
                            <ElementCard
                              key={item.id}
                              item={item}
                              isRole={isRole}
                              isUser={isUser}
                              isChannel={isChannel}
                              copiedId={copiedId}
                              onCopy={copyToken}
                              onInsert={insertAtCursor}
                              getRoleInsertion={getRoleInsertion}
                              getUserInsertion={getUserInsertion}
                              getChannelInsertion={getChannelInsertion}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Create Custom Variable Dialog */}
          <Dialog open={isCreateVarOpen} onOpenChange={setIsCreateVarOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Custom Variable</DialogTitle>
                <DialogDescription>
                  Create a reusable variable that can be inserted into messages and conditions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="var-name">Variable Name</Label>
                  <Input
                    id="var-name"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    placeholder="e.g., user_points"
                    className="col-span-3"
                  />
                  <p className="text-xs text-muted-foreground">
                    Key will be: {newVarName ? generateVariableKey(newVarName) : "..."}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="var-description">Description (optional)</Label>
                  <Textarea
                    id="var-description"
                    value={newVarDescription}
                    onChange={(e) => setNewVarDescription(e.target.value)}
                    placeholder="What this variable represents"
                    className="col-span-3"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="var-default">Default Value (optional)</Label>
                  <Input
                    id="var-default"
                    value={newVarDefault}
                    onChange={(e) => setNewVarDefault(e.target.value)}
                    placeholder="Default value if none is set"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateVarOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (newVarName.trim()) {
                      customVars.createVariable(newVarName.trim(), newVarDescription, newVarDefault);
                      setNewVarName("");
                      setNewVarDescription("");
                      setNewVarDefault("");
                      setIsCreateVarOpen(false);
                    }
                  }}
                  disabled={!newVarName.trim()}
                >
                  Create Variable
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </aside>
  );
}

interface ElementCardProps {
  item: ElementCatalogItem;
  isRole: boolean;
  isUser: boolean;
  isChannel: boolean;
  copiedId: string | null;
  onCopy: (token: string, id: string) => void;
  onInsert: (token: string) => void;
  getRoleInsertion: (role: RoleElement, format: RoleFormat) => { value: string; label: string };
  getUserInsertion: (user: UserElement, format: UserFormat) => { value: string; label: string };
  getChannelInsertion: (channel: ChannelElement, format: ChannelFormat) => { value: string; label: string };
}

function ElementCard({
  item,
  isRole,
  isUser,
  isChannel,
  copiedId,
  onCopy,
  onInsert,
  getRoleInsertion,
  getUserInsertion,
  getChannelInsertion,
}: ElementCardProps) {
  const token = item.insertions[0] ?? `{{element:${item.variable_key}}}`;
  const isCopied = copiedId === item.id;

  // Handle drag start
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", token);
    e.dataTransfer.effectAllowed = "copy";
  };

  // Simple element (no format options)
  if (!isRole && !isUser && !isChannel) {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        className={cn(
          "group flex items-center gap-2 rounded-md px-2 py-1.5",
          "bg-muted/30 hover:bg-muted/60",
          "border border-transparent hover:border-border",
          "transition-all cursor-grab active:cursor-grabbing"
        )}
      >
        <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{item.name}</div>
          <div className="font-mono text-[10px] text-muted-foreground truncate">
            {token}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onCopy(token, item.id)}
            title="Copy"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onInsert(token)}
            title="Insert at cursor"
          >
            <MousePointerClick className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  // Role element with format options
  if (isRole && "roleData" in item) {
    const role = item as RoleElement;
    return (
      <RoleCard
        role={role}
        copiedId={copiedId}
        onCopy={onCopy}
        onInsert={onInsert}
        getRoleInsertion={getRoleInsertion}
      />
    );
  }

  // User element with format options
  if (isUser && "userData" in item) {
    const user = item as UserElement;
    return (
      <UserCard
        user={user}
        copiedId={copiedId}
        onCopy={onCopy}
        onInsert={onInsert}
        getUserInsertion={getUserInsertion}
      />
    );
  }

  // Channel element with format options
  if (isChannel && "channelData" in item) {
    const channel = item as ChannelElement;
    return (
      <ChannelCard
        channel={channel}
        copiedId={copiedId}
        onCopy={onCopy}
        onInsert={onInsert}
        getChannelInsertion={getChannelInsertion}
      />
    );
  }

  return null;
}

interface RoleCardProps {
  role: RoleElement;
  copiedId: string | null;
  onCopy: (token: string, id: string) => void;
  onInsert: (token: string) => void;
  getRoleInsertion: (role: RoleElement, format: RoleFormat) => { value: string; label: string };
}

function RoleCard({ role, copiedId, onCopy, onInsert, getRoleInsertion }: RoleCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<RoleFormat>("mention");
  const { value, label } = getRoleInsertion(role, selectedFormat);
  const isCopied = copiedId === role.id;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", value);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "group rounded-md px-2 py-1.5",
        "bg-muted/30 hover:bg-muted/60",
        "border border-transparent hover:border-border",
        "transition-all cursor-grab active:cursor-grabbing"
      )}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50" />
        <div
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: role.roleData.color ? `#${role.roleData.color.toString(16).padStart(6, "0")}` : "#99aab5" }}
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{role.name}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 text-xs px-2">
              {label}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Insert as...</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setSelectedFormat("mention"); onInsert(getRoleInsertion(role, "mention").value); }}>
              Mention <span className="ml-auto text-muted-foreground font-mono text-[10px]">&lt;@&amp;id&gt;</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedFormat("count"); onInsert(getRoleInsertion(role, "count").value); }}>
              Member Count <span className="ml-auto text-muted-foreground text-[10px]">{"{{count}}"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedFormat("name"); onInsert(getRoleInsertion(role, "name").value); }}>
              Name Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedFormat("id"); onInsert(getRoleInsertion(role, "id").value); }}>
              ID Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between mt-1.5 pl-5">
        <code className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">{value}</code>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onCopy(value, role.id)}
            title="Copy"
          >
            {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onInsert(value)}
            title="Insert at cursor"
          >
            <MousePointerClick className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface UserCardProps {
  user: UserElement;
  copiedId: string | null;
  onCopy: (token: string, id: string) => void;
  onInsert: (token: string) => void;
  getUserInsertion: (user: UserElement, format: UserFormat) => { value: string; label: string };
}

function UserCard({ user, copiedId, onCopy, onInsert, getUserInsertion }: UserCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<UserFormat>("mention");
  const { value, label } = getUserInsertion(user, selectedFormat);
  const isCopied = copiedId === user.id;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", value);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "group rounded-md px-2 py-1.5",
        "bg-muted/30 hover:bg-muted/60",
        "border border-transparent hover:border-border",
        "transition-all cursor-grab active:cursor-grabbing"
      )}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50" />
        <div className="h-5 w-5 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[8px] text-white font-bold">
          {(user.userData.global_name || user.userData.username).charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{user.name}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 text-xs px-2">
              {label}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Insert as...</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setSelectedFormat("mention"); onInsert(getUserInsertion(user, "mention").value); }}>
              Mention <span className="ml-auto text-muted-foreground font-mono text-[10px]">&lt;@id&gt;</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedFormat("tag"); onInsert(getUserInsertion(user, "tag").value); }}>
              Tag <span className="ml-auto text-muted-foreground font-mono text-[10px]">@username</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedFormat("username"); onInsert(getUserInsertion(user, "username").value); }}>
              Username
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedFormat("global_name"); onInsert(getUserInsertion(user, "global_name").value); }}>
              Display Name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedFormat("id"); onInsert(getUserInsertion(user, "id").value); }}>
              User ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedFormat("avatar"); onInsert(getUserInsertion(user, "avatar").value); }}>
              Avatar URL
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between mt-1.5 pl-5">
        <code className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">{value}</code>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onCopy(value, user.id)}
            title="Copy"
          >
            {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onInsert(value)}
            title="Insert at cursor"
          >
            <MousePointerClick className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ChannelCardProps {
  channel: ChannelElement;
  copiedId: string | null;
  onCopy: (token: string, id: string) => void;
  onInsert: (token: string) => void;
  getChannelInsertion: (channel: ChannelElement, format: ChannelFormat) => { value: string; label: string };
}

function ChannelCard({ channel, copiedId, onCopy, onInsert, getChannelInsertion }: ChannelCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<ChannelFormat>("mention");
  const { value, label } = getChannelInsertion(channel, selectedFormat);
  const isCopied = copiedId === channel.id;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", value);
    e.dataTransfer.effectAllowed = "copy";
  };

  // Channel type icons
  const getChannelIcon = () => {
    switch (channel.channelData.type) {
      case 0:
        return "#"; // Text
      case 2:
        return "🔊"; // Voice
      case 4:
        return "📁"; // Category
      case 5:
        return "📢"; // Announcement
      case 10:
      case 11:
      case 12:
        return "🧵"; // Thread
      case 13:
        return "📺"; // Stage
      default:
        return "#";
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "group rounded-md px-2 py-1.5",
        "bg-muted/30 hover:bg-muted/60",
        "border border-transparent hover:border-border",
        "transition-all cursor-grab active:cursor-grabbing"
      )}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50" />
        <span className="text-xs text-muted-foreground shrink-0">{getChannelIcon()}</span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{channel.name}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 text-xs px-2">
              {label}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Insert as...</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setSelectedFormat("mention"); onInsert(getChannelInsertion(channel, "mention").value); }}>
              Mention <span className="ml-auto text-muted-foreground font-mono text-[10px]">&lt;#id&gt;</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedFormat("name"); onInsert(getChannelInsertion(channel, "name").value); }}>
              Name Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedFormat("id"); onInsert(getChannelInsertion(channel, "id").value); }}>
              Channel ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between mt-1.5 pl-5">
        <code className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">{value}</code>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onCopy(value, channel.id)}
            title="Copy"
          >
            {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onInsert(value)}
            title="Insert at cursor"
          >
            <MousePointerClick className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
