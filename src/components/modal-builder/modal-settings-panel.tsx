"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Hash, Users, Shield, X, Check, Settings, RefreshCw, AlertCircle, Workflow } from "lucide-react";
import { useDiscordGuildInventory } from "@/hooks/use-discord-guild-inventory";
import { useServer } from "@/hooks/use-server";
import { ModalWorkbench } from "@/components/modal-workbench/modal-workbench";
import type { ModalField } from "@/components/modal-workbench/field-action-card";
import type { ActionGraphDocument, ModalSettings as WorkbenchSettings } from "@/components/component-v2/types";
import type { ComponentType } from "./discord-modal-builder";

interface RoleRestrictions {
  requiredRoles: string[];
  restrictedRoles: string[];
}

interface RoleOutput {
  addRoles: string[];
  removeRoles: string[];
}

interface ModalSettingsData {
  roleRestrictions: RoleRestrictions;
  outputChannel: string;
  mentions: string[];
  roleOutput: RoleOutput;
}

// Convert ModalComponent fields to ModalField format for the workbench
function fieldsToModalFields(fields: { id: string; type: ComponentType; label: string; required: boolean }[]): ModalField[] {
  return fields.map((f) => ({
    id: f.id,
    type: f.type as ModalField["type"],
    label: f.label,
    required: f.required,
  }));
}

// Convert between ModalSettingsData (settings panel) and WorkbenchSettings (workbench)
function settingsToWorkbenchSettings(settings: ModalSettingsData): WorkbenchSettings {
  return {
    roleRestrictions: settings.roleRestrictions.requiredRoles,
    outputChannels: settings.outputChannel ? [settings.outputChannel] : [],
    roleAssignments: settings.roleOutput.addRoles,
  };
}

function workbenchSettingsToSettings(ws: WorkbenchSettings): ModalSettingsData {
  return {
    roleRestrictions: {
      requiredRoles: ws.roleRestrictions ?? [],
      restrictedRoles: [],
    },
    outputChannel: ws.outputChannels?.[0] ?? "",
    mentions: [],
    roleOutput: {
      addRoles: ws.roleAssignments ?? [],
      removeRoles: [],
    },
  };
}

interface ModalSettingsPanelProps {
  serverId: string;
  settings: ModalSettingsData;
  onChange: (settings: ModalSettingsData) => void;
  modalId?: string;
  modalName?: string;
  fields?: { id: string; type: ComponentType; label: string; required: boolean }[];
  actionGraph?: ActionGraphDocument;
  onActionGraphChange?: (graph: ActionGraphDocument) => void;
}

// Discord-style multi-select for roles
function RoleMultiSelect({
  label,
  description,
  selected,
  onChange,
  roles,
}: {
  label: string;
  description?: string;
  selected: string[];
  onChange: (selected: string[]) => void;
  roles: { id: string; name: string; color: number }[];
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const filtered = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedRoles = roles.filter((r) => selected.includes(r.id));

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[#f1f1f2]">{label}</label>
      {description && <p className="mb-2 text-xs text-[#b5bac1]">{description}</p>}

      {/* Selected tags */}
      {selectedRoles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {selectedRoles.map((role) => (
            <span
              key={role.id}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs"
              style={{
                backgroundColor: `#${role.color.toString(16).padStart(6, "0")}20`,
                color: `#${role.color.toString(16).padStart(6, "0")}`,
                border: `1px solid #${role.color.toString(16).padStart(6, "0")}40`,
              }}
            >
              {role.name}
              <button
                type="button"
                onClick={() => onChange(selected.filter((id) => id !== role.id))}
                className="hover:opacity-80"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded border border-[#3f4147] bg-[#1e1f22] px-3 py-2 text-sm text-[#c7c6cb] hover:border-[#5865F2]"
        >
          <span>{selected.length > 0 ? `${selected.length} selected` : "Select roles..."}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded border border-[#3f4147] bg-[#2b2d31] shadow-lg max-h-48 overflow-y-auto">
            <div className="p-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search roles..."
                className="w-full rounded border border-[#3f4147] bg-[#1e1f22] px-2 py-1.5 text-sm text-[#f1f1f2] outline-none placeholder:text-[#8f8e8e]"
              />
            </div>
            <div className="max-h-32 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-xs text-[#8f8e8e]">No roles found</div>
              ) : (
                filtered.map((role) => {
                  const isSelected = selected.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        onChange(
                          isSelected
                            ? selected.filter((id) => id !== role.id)
                            : [...selected, role.id]
                        );
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-[#f1f1f2] hover:bg-[#3f4147]"
                    >
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: `#${role.color.toString(16).padStart(6, "0")}` }}
                      />
                      <span className="flex-1 text-left">{role.name}</span>
                      {isSelected && <Check className="h-3 w-3 text-[#23A55A]" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Discord-style channel select
function ChannelSelect({
  label,
  description,
  selected,
  onChange,
  channels,
}: {
  label: string;
  description?: string;
  selected: string;
  onChange: (channelId: string) => void;
  channels: { id: string; name: string; type: number }[];
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const textChannels = channels.filter((ch) => ch.type === 0);
  const filtered = textChannels.filter((ch) =>
    ch.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedChannel = textChannels.find((ch) => ch.id === selected || ch.name === selected);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[#f1f1f2]">
        {label} <span className="text-[#f23f42]">*</span>
      </label>
      {description && <p className="mb-2 text-xs text-[#b5bac1]">{description}</p>}

      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-2 rounded border border-[#3f4147] bg-[#1e1f22] px-3 py-2 text-sm text-left hover:border-[#5865F2]"
        >
          <Hash className="h-4 w-4 text-[#8f8e8e]" />
          <span className={selectedChannel ? "text-[#f1f1f2]" : "text-[#8f8e8e]"}>
            {selectedChannel?.name || "Select a channel..."}
          </span>
          <ChevronDown className="ml-auto h-4 w-4 text-[#8f8e8e]" />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded border border-[#3f4147] bg-[#2b2d31] shadow-lg max-h-48 overflow-y-auto">
            <div className="p-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search channels..."
                className="w-full rounded border border-[#3f4147] bg-[#1e1f22] px-2 py-1.5 text-sm text-[#f1f1f2] outline-none placeholder:text-[#8f8e8e]"
              />
            </div>
            <div className="max-h-32 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-xs text-[#8f8e8e]">No channels found</div>
              ) : (
                filtered.map((ch) => {
                  const isSelected = selected === ch.id || selected === ch.name;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        onChange(ch.id);
                        setOpen(false);
                        setSearch("");
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-[#f1f1f2] hover:bg-[#3f4147]"
                    >
                      <Hash className="h-3 w-3 text-[#8f8e8e]" />
                      <span>{ch.name}</span>
                      {isSelected && <Check className="ml-auto h-3 w-3 text-[#23A55A]" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Discord-style mention select (roles + users)
function MentionSelect({
  label,
  description,
  selected,
  onChange,
  roles,
  users,
}: {
  label: string;
  description?: string;
  selected: string[];
  onChange: (mentions: string[]) => void;
  roles: { id: string; name: string; color: number }[];
  users: { id: string; username: string; global_name?: string | null; avatar?: string | null }[];
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsers = users.filter((u) =>
    (u.global_name ?? u.username).toLowerCase().includes(search.toLowerCase())
  );

  const getDisplayTag = (mention: string) => {
    if (mention.startsWith("<@&")) {
      const roleId = mention.slice(3, -1);
      const role = roles.find((r) => r.id === roleId);
      return { type: "role" as const, name: role?.name ?? "Unknown Role", color: role?.color ?? 0 };
    } else if (mention.startsWith("<@")) {
      const userId = mention.slice(2, -1);
      const user = users.find((u) => u.id === userId);
      return { type: "user" as const, name: user?.global_name ?? user?.username ?? "Unknown User" };
    }
    return { type: "raw" as const, name: mention };
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[#f1f1f2]">
        {label} <span className="text-[#8f8e8e]">({selected.length})</span>
      </label>
      {description && <p className="mb-2 text-xs text-[#b5bac1]">{description}</p>}

      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {selected.map((m) => {
            const tag = getDisplayTag(m);
            return (
              <span
                key={m}
                className="flex items-center gap-1 rounded border border-[#5865F2]/40 bg-[#5865F2]/20 px-1.5 py-0.5 text-xs text-[#5865F2]"
              >
                {tag.type === "role" && (
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: `#${tag.color.toString(16).padStart(6, "0")}` }}
                  />
                )}
                {tag.name}
                <button
                  type="button"
                  onClick={() => onChange(selected.filter((s) => s !== m))}
                  className="hover:opacity-80"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Dropdown */}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded border border-[#3f4147] bg-[#1e1f22] px-3 py-2 text-sm text-[#c7c6cb] hover:border-[#5865F2]"
        >
          <span>Add ping...</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded border border-[#3f4147] bg-[#2b2d31] shadow-lg max-h-48 overflow-y-auto">
            <div className="p-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search roles or users..."
                className="w-full rounded border border-[#3f4147] bg-[#1e1f22] px-2 py-1.5 text-sm text-[#f1f1f2] outline-none placeholder:text-[#8f8e8e]"
                autoFocus
              />
            </div>

            {search.length === 0 && (
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#8f8e8e]">
                Type to search...
              </div>
            )}

            {search.length > 0 && (
              <>
                {filteredRoles.length > 0 && (
                  <>
                    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#8f8e8e]">
                      Roles
                    </div>
                    {filteredRoles.slice(0, 10).map((role) => {
                      const mention = `<@&${role.id}>`;
                      const isSelected = selected.includes(mention);
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => {
                            onChange(isSelected ? selected.filter((s) => s !== mention) : [...selected, mention]);
                            setSearch("");
                          }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-[#f1f1f2] hover:bg-[#3f4147]"
                        >
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: `#${role.color.toString(16).padStart(6, "0")}` }}
                          />
                          <span>{role.name}</span>
                          {isSelected && <Check className="ml-auto h-3 w-3 text-[#23A55A]" />}
                        </button>
                      );
                    })}
                  </>
                )}

                {filteredUsers.length > 0 && (
                  <>
                    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#8f8e8e]">
                      Users
                    </div>
                    {filteredUsers.slice(0, 10).map((user) => {
                      const mention = `<@${user.id}>`;
                      const isSelected = selected.includes(mention);
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            onChange(isSelected ? selected.filter((s) => s !== mention) : [...selected, mention]);
                            setSearch("");
                          }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-[#f1f1f2] hover:bg-[#3f4147]"
                        >
                          <div className="h-4 w-4 rounded-full bg-[#5865F2] flex items-center justify-center text-[8px] font-bold text-white">
                            {(user.global_name ?? user.username)?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <span>{user.global_name ?? user.username}</span>
                          {isSelected && <Check className="ml-auto h-3 w-3 text-[#23A55A]" />}
                        </button>
                      );
                    })}
                  </>
                )}

                {filteredRoles.length === 0 && filteredUsers.length === 0 && (
                  <div className="px-3 py-2 text-xs text-[#8f8e8e]">No results found</div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ModalSettingsPanel({
  serverId,
  settings,
  onChange,
  modalId,
  modalName = "Modal",
  fields = [],
  actionGraph,
  onActionGraphChange,
}: ModalSettingsPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [workbenchOpen, setWorkbenchOpen] = useState(false);

  // First fetch the server to get the discordGuildId (Discord snowflake)
  // The route param serverId is the internal database UUID, not the Discord guild ID
  const { data: serverData, isLoading: isLoadingServer, isError: isServerError } = useServer(serverId);

  // Extract discordGuildId from the nested response structure
  // API returns: { server: { server: Server, member_count: number } }
  // serverData.server = { server: Server, member_count }
  // serverData.server.server = Server (which has discordGuildId)
  const discordGuildId = serverData?.server?.server?.discordGuildId;

  // Only fetch inventory once we have the Discord guild ID
  const { data: inventory, isLoading: isLoadingInventory, isError: isInventoryError, refetch } = useDiscordGuildInventory(discordGuildId);

  const isLoading = isLoadingServer || isLoadingInventory;
  const isError = isServerError || isInventoryError;

  const roles = inventory?.roles ?? [];
  const channels = inventory?.channels ?? [];
  const users = inventory?.users ?? [];

  // Convert fields to ModalField format for workbench
  const modalFields: ModalField[] = fieldsToModalFields(fields);

  // Handle workbench save
  const handleWorkbenchSave = (payload: { graph: ActionGraphDocument; settings: WorkbenchSettings }) => {
    // Update action graph if callback provided
    if (onActionGraphChange) {
      onActionGraphChange(payload.graph);
    }
    // Convert workbench settings back to panel settings format
    onChange({
      ...settings,
      ...workbenchSettingsToSettings(payload.settings),
    });
  };

  return (
    <>
      <div className="rounded-lg border border-[#3f4147] bg-[#232327]">
        {/* Header */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-[#b5bac1]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[#b5bac1]" />
            )}
          <Settings className="h-4 w-4 text-[#b5bac1]" />
          <span className="font-medium text-[#f1f1f2]">Settings</span>
        </div>
        <span className="text-xs text-[#8f8e8e]">
          {settings.outputChannel ? "Configured" : "Not configured"}
        </span>
      </button>

      {expanded && (
        <div className="space-y-5 border-t border-[#3f4147] px-4 py-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-4 text-sm text-[#b5bac1]">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Loading Discord data...
            </div>
          )}

          {/* Error State */}
          {isError && !isLoading && (
            <div className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-[#ef4444] font-medium">Failed to load Discord data</p>
                  <p className="text-xs text-[#b5bac1] mt-1">
                    Make sure the bot is in the server and has synced guild data.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-2 flex items-center gap-1.5 text-xs text-[#5865F2] hover:text-[#5865F2]/80 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State - Bot may not have synced */}
          {!isLoading && !isError && roles.length === 0 && channels.length === 0 && (
            <div className="rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-[#f59e0b] font-medium">No Discord data found</p>
                  <p className="text-xs text-[#b5bac1] mt-1">
                    The bot needs to sync roles and channels. This happens automatically when the bot starts or joins the server.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-2 flex items-center gap-1.5 text-xs text-[#5865F2] hover:text-[#5865F2]/80 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings - only show if we have data or it's loading */}
          {(!isLoading && !isError && (roles.length > 0 || channels.length > 0)) && (
            <>
              {/* Role Restrictions */}
              <RoleMultiSelect
                label="Role Restrictions"
                description="Only users with these roles can trigger this modal."
                selected={settings.roleRestrictions.requiredRoles}
                onChange={(requiredRoles) =>
                  onChange({
                    ...settings,
                    roleRestrictions: { ...settings.roleRestrictions, requiredRoles },
                  })
                }
                roles={roles}
              />

              {/* Output Channel */}
              <ChannelSelect
                label="Output Channel"
                description="Where to send the modal submission."
                selected={settings.outputChannel}
                onChange={(channelId) => onChange({ ...settings, outputChannel: channelId })}
                channels={channels}
              />

              {/* Ping on Submission */}
              <MentionSelect
                label="Ping on Submission"
                description="Roles or users to ping when a submission is received."
                selected={settings.mentions}
                onChange={(mentions) => onChange({ ...settings, mentions })}
                roles={roles}
                users={users}
              />

              {/* Roles to Grant */}
              <RoleMultiSelect
                label="Roles to Grant"
                description="Roles to give the user after they submit the modal."
                selected={settings.roleOutput.addRoles}
                onChange={(addRoles) =>
                  onChange({
                    ...settings,
                    roleOutput: { ...settings.roleOutput, addRoles },
                  })
                }
                roles={roles}
              />

              {/* Roles to Remove */}
              <RoleMultiSelect
                label="Roles to Remove"
                description="Roles to remove from the user after they submit the modal."
                selected={settings.roleOutput.removeRoles}
                onChange={(removeRoles) =>
                  onChange({
                    ...settings,
                    roleOutput: { ...settings.roleOutput, removeRoles },
                  })
                }
                roles={roles}
              />

              {/* Advanced Workbench Button */}
              {fields.length > 0 && (
                <div className="pt-2 border-t border-[#3f4147]">
                  <button
                    type="button"
                    onClick={() => setWorkbenchOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded border border-[#3f4147] bg-[#2b2d31] px-4 py-2.5 text-sm text-[#c7c6cb] hover:border-[#5865F2] hover:text-[#f1f1f2] transition-colors"
                  >
                    <Workflow className="h-4 w-4" />
                    <span>Open Action Workbench</span>
                    {(actionGraph?.nodes.length ?? 0) > 0 && (
                      <span className="text-xs text-[#8f8e8e]">({actionGraph?.nodes.length} actions)</span>
                    )}
                  </button>
                  <p className="mt-1.5 text-xs text-[#8f8e8e] text-center">
                    Configure advanced actions when users submit the modal
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>

    {/* Modal Workbench Dialog */}
    {fields.length > 0 && (
      <ModalWorkbench
        open={workbenchOpen}
        onOpenChange={setWorkbenchOpen}
        serverId={serverId}
        modalName={modalName}
        fields={modalFields}
        graph={actionGraph}
        settings={settingsToWorkbenchSettings(settings)}
        onSave={handleWorkbenchSave}
      />
    )}
  </>
  );
}