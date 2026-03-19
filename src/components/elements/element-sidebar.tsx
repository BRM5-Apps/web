"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Copy, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useServer } from "@/hooks/use-server";
import { useDiscordGuildInventory } from "@/hooks/use-discord-guild-inventory";
import { useElements } from "@/hooks/use-elements";
import { useElementInsertion } from "@/components/elements/element-insertion-provider";
import type { ElementCatalogItem } from "@/types/element";

const CATEGORY_LABELS: Record<string, string> = {
  system: "System",
  user: "User Data",
  server: "Server Stats",
  rank: "Rank",
  module_fields: "Module Fields",
  custom_counters: "Custom Counters",
  custom: "Custom",
  discord_roles: "Discord Roles",
  discord_channels: "Discord Channels",
  discord_users: "Discord Users",
};

export function ElementSidebar({
  serverId,
  className,
}: {
  serverId: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const { data, isLoading } = useElements(serverId);
  const server = useServer(serverId);
  const guildInventory = useDiscordGuildInventory(server.data?.discordGuildId);
  const { insertToken } = useElementInsertion();

  const catalogItems = useMemo<ElementCatalogItem[]>(() => {
    const roleItems = (guildInventory.data?.roles ?? []).map<ElementCatalogItem>((role) => ({
      id: `discord-role-${role.id}`,
      name: role.name,
      variable_key: `discord_role_${role.id}`,
      element_type: "STATIC",
      description: role.managed ? "Managed Discord role" : "Discord server role",
      category: "discord_roles",
      source: "discord",
      insertions: [`<@&${role.id}>`],
      config: { discord_id: role.id, discord_kind: "role" },
    }));

    const channelItems = (guildInventory.data?.channels ?? []).map<ElementCatalogItem>((channel) => ({
      id: `discord-channel-${channel.id}`,
      name: channel.name,
      variable_key: `discord_channel_${channel.id}`,
      element_type: "STATIC",
      description: `Discord channel (type ${channel.type})`,
      category: "discord_channels",
      source: "discord",
      insertions: [`<#${channel.id}>`],
      config: { discord_id: channel.id, discord_kind: "channel", channel_type: channel.type },
    }));

    const userItems = (guildInventory.data?.users ?? []).map<ElementCatalogItem>((user) => ({
      id: `discord-user-${user.id}`,
      name: user.global_name || user.username,
      variable_key: `discord_user_${user.id}`,
      element_type: "STATIC",
      description: user.bot ? `Bot user @${user.username}` : `Discord user @${user.username}`,
      category: "discord_users",
      source: "discord",
      insertions: [`<@${user.id}>`],
      config: { discord_id: user.id, discord_kind: "user", username: user.username },
    }));

    return [...(data ?? []), ...roleItems, ...channelItems, ...userItems];
  }, [data, guildInventory.data]);

  const grouped = useMemo(() => {
    const items = catalogItems.filter((item) => {
      const haystack = `${item.name} ${item.variable_key} ${item.description}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });

    return items.reduce<Record<string, typeof items>>((acc, item) => {
      const key = item.category || "custom";
      acc[key] ??= [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [catalogItems, query]);

  async function copyToken(token: string) {
    await navigator.clipboard.writeText(token);
    toast.success("Element token copied");
  }

  return (
    <aside
      className={cn(
        "rounded-lg border border-border bg-card transition-all",
        collapsed ? "w-[52px]" : "w-full lg:w-[320px]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-3">
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold">Elements</p>
            <p className="text-xs text-muted-foreground">
              Insert <code>{"{{element:key}}"}</code> tokens into supported fields.
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
                placeholder="Search elements"
                className="pl-8"
              />
            </div>
          </div>

          <ScrollArea className="h-[520px] lg:h-[700px]">
            <div className="space-y-4 p-3">
              {(isLoading || server.isLoading || guildInventory.isLoading) && (
                <p className="text-sm text-muted-foreground">Loading elements...</p>
              )}
              {!isLoading && !server.isLoading && !guildInventory.isLoading && Object.keys(grouped).length === 0 && (
                <p className="text-sm text-muted-foreground">No elements match this search.</p>
              )}

              {Object.entries(grouped).map(([category, items]) => (
                <section key={category} className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {CATEGORY_LABELS[category] ?? category}
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const token = item.insertions[0] ?? `{{element:${item.variable_key}}}`;
                      return (
                        <div key={item.id} className="rounded-md border border-border bg-background p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">{item.name}</div>
                              <div className="truncate font-mono text-xs text-muted-foreground">{token}</div>
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0"
                              onClick={() => copyToken(token)}
                              aria-label={`Copy ${item.name}`}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          {item.description && (
                            <p className="mt-2 text-xs text-muted-foreground">{item.description}</p>
                          )}
                          {item.counter_meta && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Current value: <span className="font-medium text-foreground">{item.counter_meta.current_value}</span>
                            </p>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-3 w-full"
                            onClick={() => {
                              if (!insertToken(token)) {
                                void copyToken(token);
                                toast.info("No active text field found. Copied token instead.");
                              }
                            }}
                          >
                            Insert Token
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </aside>
  );
}
