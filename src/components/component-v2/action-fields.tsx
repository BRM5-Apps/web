"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Trash2, Hash, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiscordCheckbox } from "@/components/shared/discord-checkbox";
import { useAllTemplates } from "@/hooks/use-templates";
import { useServer } from "@/hooks/use-server";
import { useDiscordGuildInventory } from "@/hooks/use-discord-guild-inventory";
import type {
  FlowAction,
  FaWait,
  FaAddRole,
  FaRemoveRole,
  FaToggleRole,
  FaSendOutput,
  FaSendToChannel,
  FaDmUser,
  FaLogToChannel,
  FaCreateThread,
  FaSetVariable,
  FaDeleteMessage,
  FaCooldown,
  FaWebhookCall,
  FaStop,
  FaRoleAction,
  FaNicknameAction,
  FaVoiceAction,
  FaChannelAction,
  FaMessageAction,
  FaThreadAction,
  FaModerationAction,
  FaDataAction,
  FaFlowControl,
  FaWaitUntil,
  FaModalAction,
} from "./types";
import {
  RoleActionFields,
  NicknameActionFields,
  VoiceActionFields,
  ChannelActionFields,
  MessageActionFields,
  ThreadActionFields,
  ModerationActionFields,
  DataActionFields,
  FlowControlFields,
  WaitUntilFields,
  ModalActionFields,
} from "./consolidated-action-fields";

interface ActionFieldsProps {
  action: FlowAction;
  onChange: (action: FlowAction) => void;
  serverId?: string;
}

export function ActionFields({ action, onChange, serverId }: ActionFieldsProps) {
  switch (action.type) {
    case "do_nothing":
      return (
        <p className="text-xs text-[#b5bac1]">
          This action does nothing. Useful for display buttons.
        </p>
      );

    case "wait":
      return <WaitFields action={action} onChange={onChange} />;

    case "add_role":
    case "remove_role":
    case "toggle_role":
      return <RoleFields action={action} onChange={onChange} />;

    case "send_output":
      return <SendOutputFields action={action} onChange={onChange} serverId={serverId} />;

    case "send_to_channel":
      return <SendToChannelFields action={action} onChange={onChange} serverId={serverId} />;

    case "dm_user":
      return <DmUserFields action={action} onChange={onChange} serverId={serverId} />;

    case "log_to_channel":
      return <LogToChannelFields action={action} onChange={onChange} />;

    case "create_thread":
      return <CreateThreadFields action={action} onChange={onChange} />;

    case "set_variable":
      return <SetVariableFields action={action} onChange={onChange} />;

    case "delete_message":
      return <DeleteMessageFields action={action} onChange={onChange} />;

    case "cooldown":
      return <CooldownFields action={action} onChange={onChange} />;

    case "webhook_call":
      return <WebhookCallFields action={action} onChange={onChange} />;

    case "stop":
      return <StopFields action={action} onChange={onChange} />;

    // Consolidated action types
    case "role_action":
      return <RoleActionFields action={action as FaRoleAction} onChange={onChange} />;

    case "nickname_action":
      return <NicknameActionFields action={action as FaNicknameAction} onChange={onChange} />;

    case "voice_action":
      return <VoiceActionFields action={action as FaVoiceAction} onChange={onChange} />;

    case "channel_action":
      return <ChannelActionFields action={action as FaChannelAction} onChange={onChange} />;

    case "message_action":
      return <MessageActionFields action={action as FaMessageAction} onChange={onChange} serverId={serverId} />;

    case "moderation_action":
      return <ModerationActionFields action={action as FaModerationAction} onChange={onChange} />;

    case "data_action":
      return <DataActionFields action={action as FaDataAction} onChange={onChange} />;

    case "flow_control":
      return <FlowControlFields action={action as FaFlowControl} onChange={onChange} />;

    case "wait_until":
      return <WaitUntilFields action={action as FaWaitUntil} onChange={onChange} />;

    case "thread_action":
      return <ThreadActionFields action={action as FaThreadAction} onChange={onChange} />;

    case "modal_action":
      return <ModalActionFields action={action as FaModalAction} onChange={onChange} serverId={serverId} />;

    default:
      return null;
  }
}

// ── Individual Field Components ──────────────────────────────────────────────

const TIME_UNITS: { value: FaWait["unit"]; label: string; multiplier: number }[] = [
  { value: "seconds", label: "Seconds", multiplier: 1 },
  { value: "minutes", label: "Minutes", multiplier: 60 },
  { value: "hours", label: "Hours", multiplier: 3600 },
  { value: "days", label: "Days", multiplier: 86400 },
  { value: "weeks", label: "Weeks", multiplier: 604800 },
  { value: "months", label: "Months", multiplier: 2592000 }, // ~30 days
];

function WaitFields({ action, onChange }: { action: FaWait; onChange: (a: FlowAction) => void }) {
  const currentUnit = TIME_UNITS.find((u) => u.value === action.unit) || TIME_UNITS[0];

  function updateDuration(value: string) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    onChange({ ...action, duration: num });
  }

  function cycleUnit(direction: "prev" | "next") {
    const currentIndex = TIME_UNITS.findIndex((u) => u.value === action.unit);
    let newIndex: number;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % TIME_UNITS.length;
    } else {
      newIndex = currentIndex === 0 ? TIME_UNITS.length - 1 : currentIndex - 1;
    }
    onChange({ ...action, unit: TIME_UNITS[newIndex].value });
  }

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-[#b5bac1]">Duration</Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            type="number"
            min={0}
            value={action.duration}
            onChange={(e) => updateDuration(e.target.value)}
            className="w-24 bg-[#1e1f22] border-[#3f4147] text-white text-center"
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => cycleUnit("prev")}
              className="w-7 h-8 rounded bg-[#1e1f22] border border-[#3f4147] text-white hover:bg-[#3f4147] flex items-center justify-center"
            >
              ◀
            </button>
            <span className="text-white min-w-[4.5rem] text-center text-sm px-2 py-1 bg-[#1e1f22] border border-[#3f4147] rounded">
              {currentUnit.label}
            </span>
            <button
              type="button"
              onClick={() => cycleUnit("next")}
              className="w-7 h-8 rounded bg-[#1e1f22] border border-[#3f4147] text-white hover:bg-[#3f4147] flex items-center justify-center"
            >
              ▶
            </button>
          </div>
        </div>
        <p className="text-[10px] text-[#b5bac1] mt-1">
          Total: {action.duration * currentUnit.multiplier} seconds
        </p>
      </div>
    </div>
  );
}

function RoleFields({
  action,
  onChange,
}: {
  action: FaAddRole | FaRemoveRole | FaToggleRole;
  onChange: (a: FlowAction) => void;
}) {
  const roleIds = action.roleIds || [];

  function addRole(value: string) {
    onChange({ ...action, roleIds: [...roleIds, value] });
  }

  function updateRole(index: number, value: string) {
    const newRoleIds = [...roleIds];
    newRoleIds[index] = value;
    onChange({ ...action, roleIds: newRoleIds });
  }

  function removeRole(index: number) {
    onChange({ ...action, roleIds: roleIds.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-[#b5bac1]">Roles ({roleIds.length})</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addRole("")}
          className="h-6 text-xs border-[#5865F2]/50 text-[#5865F2] hover:bg-[#5865F2]/20"
        >
          + Add Role
        </Button>
      </div>

      {roleIds.length === 0 ? (
        <p className="text-xs text-[#b5bac1] italic">No roles configured</p>
      ) : (
        <div className="space-y-2">
          {roleIds.map((roleId, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={roleId}
                onChange={(e) => updateRole(index, e.target.value)}
                placeholder="Role ID or {{element:roleId}}"
                className="flex-1 bg-[#1e1f22] border-[#3f4147] text-white text-sm h-8"
              />
              <button
                type="button"
                onClick={() => removeRole(index)}
                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SendOutputFields({
  action,
  onChange,
  serverId,
}: {
  action: FaSendOutput;
  onChange: (a: FlowAction) => void;
  serverId?: string;
}) {
  const templates = useAllTemplates(serverId || "");

  // Fetch server to get discordGuildId
  const server = useServer(serverId || "");
  const discordGuildId = (server.data as { server?: { server?: { discordGuildId?: string } } })?.server?.server?.discordGuildId ?? undefined;
  const guildInventory = useDiscordGuildInventory(discordGuildId);
  const channels = guildInventory.data?.channels ?? [];

  // Filter to text-based channels (type 0 = text, 5 = announcement, 10-12 = threads)
  const textChannels = channels.filter(c => c.type === 0 || c.type === 5 || c.type === 10 || c.type === 11 || c.type === 12);

  // Check if channelId is a variable (starts with {{)
  const isVariableChannel = action.channelId?.startsWith("{{");
  const selectedChannel = channels.find(c => c.id === action.channelId);

  function handleChannelSelect(channelId: string) {
    onChange({ ...action, channelId });
  }

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-[#b5bac1]">Output Type</Label>
        <Select
          value={action.outputKind}
          onValueChange={(v) => onChange({ ...action, outputKind: v as "message" | "modal" })}
        >
          <SelectTrigger className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#2b2d31] border-[#3f4147]">
            <SelectItem value="message">Message</SelectItem>
            <SelectItem value="modal">Modal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Channel selector - only for message output */}
      {action.outputKind === "message" && !action.reply && !action.edit && !action.editOriginal && (
        <div>
          <Label className="text-xs text-[#b5bac1]">Target Channel (optional)</Label>
          <Select
            value={isVariableChannel ? "__variable__" : action.channelId || "__default__"}
            onValueChange={(v) => {
              if (v === "__variable__") {
                return;
              }
              if (v === "__default__") {
                onChange({ ...action, channelId: undefined });
              } else {
                handleChannelSelect(v);
              }
            }}
          >
            <SelectTrigger className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white">
              <SelectValue placeholder="Same as interaction (default)">
                {selectedChannel ? (
                  <span className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-[#80848E]" />
                    {selectedChannel.name}
                  </span>
                ) : isVariableChannel ? (
                  <span className="text-[#5865F2] font-mono text-xs">{action.channelId}</span>
                ) : (
                  "Same as interaction (default)"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#2b2d31] border-[#3f4147] max-h-60">
              <SelectItem value="__default__">
                <span className="text-[#80848E]">Same as interaction (default)</span>
              </SelectItem>
              <SelectItem value="__variable__">
                <span className="text-[#5865F2]">{"{ }"} Use variable</span>
              </SelectItem>
              {textChannels.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Text Channels</div>
                  {textChannels
                    .sort((a, b) => a.position - b.position)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <Hash className="h-3.5 w-3.5 text-[#80848E]" />
                          {c.name}
                        </span>
                      </SelectItem>
                    ))}
                </>
              )}
            </SelectContent>
          </Select>
          {/* Manual input for variables */}
          <Input
            value={action.channelId || ""}
            onChange={(e) => onChange({ ...action, channelId: e.target.value || undefined })}
            placeholder="Or enter channel ID / {{event.channel.id}}"
            className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white text-sm h-8"
          />
        </div>
      )}

      <div>
        <Label className="text-xs text-[#b5bac1]">Template</Label>
        <Select
          value={action.templateId || ""}
          onValueChange={(v) => {
            const templateId = v || undefined;
            // Find the template type based on the ID
            let templateType: typeof action.templateType = undefined;
            if (templates.texts.find((t) => t.id === v)) templateType = "text";
            else if (templates.embeds.find((t) => t.id === v)) templateType = "embed";
            else if (templates.containers.find((t) => t.id === v)) templateType = "container";
            else if (templates.modals.find((t) => t.id === v)) templateType = "modal";
            onChange({ ...action, templateId, templateType });
          }}
        >
          <SelectTrigger className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white">
            <SelectValue placeholder="Select template..." />
          </SelectTrigger>
          <SelectContent className="bg-[#2b2d31] border-[#3f4147] max-h-60">
            {templates.texts.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Text Templates</div>
                {templates.texts.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </>
            )}
            {templates.embeds.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Embed Templates</div>
                {templates.embeds.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </>
            )}
            {templates.containers.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Container Templates</div>
                {templates.containers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </>
            )}
            {action.outputKind === "modal" && templates.modals.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Modal Templates</div>
                {templates.modals.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {action.outputKind === "message" && (
        <div className="space-y-3 pt-2 border-t border-[#3f4147]">
          <Label className="text-xs text-[#b5bac1] uppercase tracking-wide">Delivery Mode</Label>

          <div className="flex rounded overflow-hidden border border-[#3f4147]">
            {(["send", "reply", "edit", "edit_original"] as const).map((mode) => {
              const labels: Record<string, string> = { send: "Send", reply: "Reply", edit: "Edit", edit_original: "Edit Original" };
              const isActive =
                mode === "reply" ? (action.reply || false) :
                mode === "edit" ? (action.edit || false) :
                mode === "edit_original" ? (action.editOriginal || false) :
                !action.reply && !action.edit && !action.editOriginal;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    const base = { ...action, reply: false, edit: false, editOriginal: false, replyEphemeral: false };
                    if (mode === "reply") onChange({ ...base, reply: true });
                    else if (mode === "edit") onChange({ ...base, edit: true, hidden: false });
                    else if (mode === "edit_original") onChange({ ...base, editOriginal: true, hidden: false });
                    else onChange(base);
                  }}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium transition-colors",
                    isActive ? "bg-[#5865F2] text-white" : "bg-[#1e1f22] text-gray-400 hover:text-white"
                  )}
                >
                  {labels[mode]}
                </button>
              );
            })}
          </div>

          {!action.edit && !action.editOriginal && (
            <DiscordCheckbox
              checked={action.hidden}
              onChange={(v) => onChange({ ...action, hidden: v })}
              label="Ephemeral"
              description="Only visible to the user who triggered the action"
              size="sm"
            />
          )}
        </div>
      )}
    </div>
  );
}

function CreateThreadFields({
  action,
  onChange,
}: {
  action: FaCreateThread;
  onChange: (a: FlowAction) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-[#b5bac1]">Channel ID</Label>
        <Input
          value={action.channelId || ""}
          onChange={(e) => onChange({ ...action, channelId: e.target.value })}
          placeholder="Parent channel ID"
          className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
        />
      </div>

      <div>
        <Label className="text-xs text-[#b5bac1]">Thread Name</Label>
        <Input
          value={action.name}
          onChange={(e) => onChange({ ...action, name: e.target.value.slice(0, 100) })}
          placeholder="Thread name"
          maxLength={100}
          className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
        />
      </div>

      <div>
        <Label className="text-xs text-[#b5bac1]">Thread Type</Label>
        <Select
          value={action.threadType || ""}
          onValueChange={(v) => onChange({ ...action, threadType: v || undefined })}
        >
          <SelectTrigger className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white">
            <SelectValue placeholder="Select type..." />
          </SelectTrigger>
          <SelectContent className="bg-[#2b2d31] border-[#3f4147]">
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function SetVariableFields({
  action,
  onChange,
}: {
  action: FaSetVariable;
  onChange: (a: FlowAction) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-[#b5bac1]">Variable Type</Label>
        <Select
          value={action.varType}
          onValueChange={(v) => onChange({ ...action, varType: v })}
        >
          <SelectTrigger className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#2b2d31] border-[#3f4147]">
            <SelectItem value="Static">Static</SelectItem>
            <SelectItem value="Dynamic">Dynamic</SelectItem>
            <SelectItem value="User">User</SelectItem>
            <SelectItem value="Guild">Guild</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-[#b5bac1]">Variable Name</Label>
        <Input
          value={action.varName}
          onChange={(e) => onChange({ ...action, varName: e.target.value })}
          placeholder="myVariable"
          className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
        />
      </div>

      <div>
        <Label className="text-xs text-[#b5bac1]">Value</Label>
        <Input
          value={action.value}
          onChange={(e) => onChange({ ...action, value: e.target.value })}
          placeholder="Value or {{element:xxx}}"
          className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
        />
      </div>
    </div>
  );
}

function DeleteMessageFields({
  action,
  onChange,
}: {
  action: FaDeleteMessage;
  onChange: (a: FlowAction) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[#b5bac1]">
        Deletes the message this component is attached to.
      </p>
      <div>
        <Label className="text-xs text-[#b5bac1]">Message ID (optional)</Label>
        <Input
          value={action.messageId || ""}
          onChange={(e) => onChange({ ...action, messageId: e.target.value })}
          placeholder="Override message ID"
          className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
        />
      </div>
    </div>
  );
}

function StopFields({ action, onChange }: { action: FaStop; onChange: (a: FlowAction) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-[#b5bac1]">Message Content</Label>
        <textarea
          value={action.content}
          onChange={(e) => onChange({ ...action, content: e.target.value.slice(0, 2000) })}
          placeholder="Optional message to send..."
          rows={3}
          maxLength={2000}
          className="mt-1 w-full bg-[#1e1f22] border border-[#3f4147] text-white rounded px-3 py-2 resize-y"
        />
      </div>

      <div className="space-y-2">
        <DiscordCheckbox
          checked={action.hidden}
          onChange={(v) => onChange({ ...action, hidden: v })}
          label="Hidden (ephemeral)"
          size="sm"
        />
        <DiscordCheckbox
          checked={action.silent}
          onChange={(v) => onChange({ ...action, silent: v })}
          label="Silent"
          size="sm"
        />
        <DiscordCheckbox
          checked={action.hideEmbeds}
          onChange={(v) => onChange({ ...action, hideEmbeds: v })}
          label="Hide Embeds"
          size="sm"
        />
      </div>
    </div>
  );
}

// ── Automation-Specific Action Fields ────────────────────────────────────────

function SendToChannelFields({
  action,
  onChange,
  serverId,
}: {
  action: FaSendToChannel;
  onChange: (a: FlowAction) => void;
  serverId?: string;
}) {
  const templates = useAllTemplates(serverId || "");

  // Fetch server to get discordGuildId
  const server = useServer(serverId || "");
  const discordGuildId = (server.data as { server?: { server?: { discordGuildId?: string } } })?.server?.server?.discordGuildId ?? undefined;
  const guildInventory = useDiscordGuildInventory(discordGuildId);
  const channels = guildInventory.data?.channels ?? [];

  // Filter to text-based channels (type 0 = text, 5 = announcement, 10-12 = threads)
  const textChannels = channels.filter(c => c.type === 0 || c.type === 5 || c.type === 10 || c.type === 11 || c.type === 12);

  // Check if channelId is a variable (starts with {{)
  const isVariableChannel = action.channelId?.startsWith("{{");
  const selectedChannel = channels.find(c => c.id === action.channelId);

  function handleChannelSelect(channelId: string) {
    onChange({ ...action, channelId });
  }

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-[#b5bac1]">Channel</Label>
        <Select
          value={isVariableChannel ? "__variable__" : action.channelId || ""}
          onValueChange={(v) => {
            if (v === "__variable__") {
              // Keep the current value if switching to variable mode
              return;
            }
            handleChannelSelect(v);
          }}
        >
          <SelectTrigger className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white">
            <SelectValue placeholder="Select a channel...">
              {selectedChannel ? (
                <span className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-[#80848E]" />
                  {selectedChannel.name}
                </span>
              ) : isVariableChannel ? (
                <span className="text-[#5865F2] font-mono text-xs">{action.channelId}</span>
              ) : (
                "Select a channel..."
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-[#2b2d31] border-[#3f4147] max-h-60">
            {/* Variable option */}
            <SelectItem value="__variable__">
              <span className="text-[#5865F2]">{"{ }"} Use variable</span>
            </SelectItem>
            {textChannels.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Text Channels</div>
                {textChannels
                  .sort((a, b) => a.position - b.position)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-[#80848E]" />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
              </>
            )}
            {channels.filter(c => c.type === 2 || c.type === 13).length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Voice Channels</div>
                {channels
                  .filter(c => c.type === 2 || c.type === 13)
                  .sort((a, b) => a.position - b.position)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </>
            )}
          </SelectContent>
        </Select>

        {/* Manual input for variables */}
        <div className="mt-2">
          <Input
            value={action.channelId || ""}
            onChange={(e) => onChange({ ...action, channelId: e.target.value })}
            placeholder="Or enter channel ID / {{event.channel.id}}"
            className="bg-[#1e1f22] border-[#3f4147] text-white text-sm h-8"
          />
        </div>
        <p className="text-[10px] text-[#80848E] mt-1">
          Use variables like {"{{event.channel.id}}"} or {"{{element:channelId}}"}
        </p>
      </div>

      <div>
        <Label className="text-xs text-[#b5bac1]">Template</Label>
        <Select
          value={action.templateId || ""}
          onValueChange={(v) => {
            const templateId = v || undefined;
            let templateType: typeof action.templateType = undefined;
            if (templates.texts.find((t) => t.id === v)) templateType = "text";
            else if (templates.embeds.find((t) => t.id === v)) templateType = "embed";
            else if (templates.containers.find((t) => t.id === v)) templateType = "container";
            onChange({ ...action, templateId, templateType });
          }}
        >
          <SelectTrigger className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white">
            <SelectValue placeholder="Select template..." />
          </SelectTrigger>
          <SelectContent className="bg-[#2b2d31] border-[#3f4147] max-h-60">
            {templates.texts.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Text Templates</div>
                {templates.texts.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </>
            )}
            {templates.embeds.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Embed Templates</div>
                {templates.embeds.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </>
            )}
            {templates.containers.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Container Templates</div>
                {templates.containers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function DmUserFields({
  action,
  onChange,
  serverId,
}: {
  action: FaDmUser;
  onChange: (a: FlowAction) => void;
  serverId?: string;
}) {
  const templates = useAllTemplates(serverId || "");

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#b5bac1]">
        Sends a DM to the user who triggered the automation event.
      </p>

      <div>
        <Label className="text-xs text-[#b5bac1]">Template</Label>
        <Select
          value={action.templateId || ""}
          onValueChange={(v) => {
            const templateId = v || undefined;
            let templateType: typeof action.templateType = undefined;
            if (templates.texts.find((t) => t.id === v)) templateType = "text";
            else if (templates.embeds.find((t) => t.id === v)) templateType = "embed";
            else if (templates.containers.find((t) => t.id === v)) templateType = "container";
            onChange({ ...action, templateId, templateType });
          }}
        >
          <SelectTrigger className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white">
            <SelectValue placeholder="Select template..." />
          </SelectTrigger>
          <SelectContent className="bg-[#2b2d31] border-[#3f4147] max-h-60">
            {templates.texts.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Text Templates</div>
                {templates.texts.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </>
            )}
            {templates.embeds.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Embed Templates</div>
                {templates.embeds.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </>
            )}
            {templates.containers.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-[#b5bac1] bg-[#1e1f22]">Container Templates</div>
                {templates.containers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-2 border-t border-[#3f4147]">
        <DiscordCheckbox
          checked={action.fallbackOnError || false}
          onChange={(v) => onChange({ ...action, fallbackOnError: v })}
          label="Fallback Channel on Error"
          description="Send to a fallback channel if DM fails"
          size="sm"
        />
      </div>

      {action.fallbackOnError && (
        <div>
          <Label className="text-xs text-[#b5bac1]">Fallback Channel ID</Label>
          <Input
            value={action.fallbackChannelId || ""}
            onChange={(e) => onChange({ ...action, fallbackChannelId: e.target.value || undefined })}
            placeholder="Channel ID for fallback"
            className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
          />
        </div>
      )}
    </div>
  );
}

const LOG_LEVELS: { value: "info" | "warn" | "error" | "success"; label: string; color: string }[] = [
  { value: "info", label: "Info", color: "#5865F2" },
  { value: "warn", label: "Warning", color: "#F0A500" },
  { value: "error", label: "Error", color: "#F23F42" },
  { value: "success", label: "Success", color: "#23A559" },
];

function LogToChannelFields({
  action,
  onChange,
}: {
  action: FaLogToChannel;
  onChange: (a: FlowAction) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-[#b5bac1]">Channel ID</Label>
        <Input
          value={action.channelId}
          onChange={(e) => onChange({ ...action, channelId: e.target.value })}
          placeholder="Log channel ID"
          className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
        />
      </div>

      <div>
        <Label className="text-xs text-[#b5bac1]">Log Level</Label>
        <div className="flex gap-1 mt-1">
          {LOG_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => onChange({ ...action, level: level.value })}
              className={cn(
                "flex-1 py-1.5 text-xs font-medium rounded transition-colors",
                action.level === level.value
                  ? "text-white"
                  : "bg-[#1e1f22] text-[#b5bac1] hover:text-white"
              )}
              style={{
                backgroundColor: action.level === level.value ? level.color : undefined,
              }}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs text-[#b5bac1]">Content</Label>
        <textarea
          value={action.content}
          onChange={(e) => onChange({ ...action, content: e.target.value })}
          placeholder="Log message content..."
          rows={3}
          className="mt-1 w-full bg-[#1e1f22] border border-[#3f4147] text-white rounded px-3 py-2 resize-y text-sm"
        />
        <p className="text-[10px] text-[#80848E] mt-1">
          Use variables: {"{{event.user.username}}"}, {"{{server.name}}"}, etc.
        </p>
      </div>

      <DiscordCheckbox
        checked={action.includeContext ?? true}
        onChange={(v) => onChange({ ...action, includeContext: v })}
        label="Include Event Context"
        description="Attach full event details to the log message"
        size="sm"
      />
    </div>
  );
}

const COOLDOWN_UNITS: { value: "seconds" | "minutes" | "hours" | "days"; label: string }[] = [
  { value: "seconds", label: "Seconds" },
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
];

function CooldownFields({
  action,
  onChange,
}: {
  action: FaCooldown;
  onChange: (a: FlowAction) => void;
}) {
  const roleIds = action.bypassRoles || [];

  function addRole(value: string) {
    onChange({ ...action, bypassRoles: [...roleIds, value] });
  }

  function removeRole(index: number) {
    onChange({ ...action, bypassRoles: roleIds.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#b5bac1]">
        Prevents the automation from re-triggering for the same key within the cooldown period.
      </p>

      <div>
        <Label className="text-xs text-[#b5bac1]">Cooldown Key</Label>
        <Input
          value={action.key}
          onChange={(e) => onChange({ ...action, key: e.target.value })}
          placeholder="default"
          className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
        />
        <p className="text-[10px] text-[#80848E] mt-1">
          Use different keys for independent cooldowns. Use {"{{event.user.id}}"} for per-user cooldowns.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-xs text-[#b5bac1]">Duration</Label>
          <Input
            type="number"
            min={1}
            value={action.duration}
            onChange={(e) => onChange({ ...action, duration: parseInt(e.target.value) || 1 })}
            className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
          />
        </div>
        <div className="flex-1">
          <Label className="text-xs text-[#b5bac1]">Unit</Label>
          <Select
            value={action.unit}
            onValueChange={(v) => onChange({ ...action, unit: v as typeof action.unit })}
          >
            <SelectTrigger className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2b2d31] border-[#3f4147]">
              {COOLDOWN_UNITS.map((u) => (
                <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-2 border-t border-[#3f4147]">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-[#b5bac1]">Bypass Roles</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addRole("")}
            className="h-6 text-xs border-[#5865F2]/50 text-[#5865F2] hover:bg-[#5865F2]/20"
          >
            + Add Role
          </Button>
        </div>
        {roleIds.length === 0 ? (
          <p className="text-xs text-[#b5bac1] italic">No bypass roles</p>
        ) : (
          <div className="space-y-2">
            {roleIds.map((roleId, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={roleId}
                  onChange={(e) => {
                    const newRoles = [...roleIds];
                    newRoles[index] = e.target.value;
                    onChange({ ...action, bypassRoles: newRoles });
                  }}
                  placeholder="Role ID"
                  className="flex-1 bg-[#1e1f22] border-[#3f4147] text-white text-sm h-8"
                />
                <button
                  type="button"
                  onClick={() => removeRole(index)}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const HTTP_METHODS: { value: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"; label: string }[] = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PUT", label: "PUT" },
  { value: "DELETE", label: "DELETE" },
  { value: "PATCH", label: "PATCH" },
];

function WebhookCallFields({
  action,
  onChange,
}: {
  action: FaWebhookCall;
  onChange: (a: FlowAction) => void;
}) {
  const headers = action.headers || {};

  function addHeader() {
    const newHeaders = { ...headers, "": "" };
    onChange({ ...action, headers: newHeaders });
  }

  function updateHeaderKey(oldKey: string, newKey: string) {
    const value = headers[oldKey];
    const newHeaders = { ...headers };
    delete newHeaders[oldKey];
    newHeaders[newKey] = value;
    onChange({ ...action, headers: newHeaders });
  }

  function updateHeaderValue(key: string, value: string) {
    onChange({ ...action, headers: { ...headers, [key]: value } });
  }

  function removeHeader(key: string) {
    const newHeaders = { ...headers };
    delete newHeaders[key];
    onChange({ ...action, headers: newHeaders });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#b5bac1]">
        Make an HTTP request to an external service when this action runs.
      </p>

      <div>
        <Label className="text-xs text-[#b5bac1]">URL</Label>
        <Input
          value={action.url}
          onChange={(e) => onChange({ ...action, url: e.target.value })}
          placeholder="https://api.example.com/webhook"
          className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
        />
        <p className="text-[10px] text-[#80848E] mt-1">
          Use variables: {"{{event.user.id}}"}, {"{{server.name}}"}, etc.
        </p>
      </div>

      <div>
        <Label className="text-xs text-[#b5bac1]">Method</Label>
        <Select
          value={action.method}
          onValueChange={(v) => onChange({ ...action, method: v as typeof action.method })}
        >
          <SelectTrigger className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#2b2d31] border-[#3f4147]">
            {HTTP_METHODS.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(action.method === "POST" || action.method === "PUT" || action.method === "PATCH") && (
        <div>
          <Label className="text-xs text-[#b5bac1]">Request Body</Label>
          <textarea
            value={action.body || ""}
            onChange={(e) => onChange({ ...action, body: e.target.value })}
            placeholder='{"key": "value"}'
            rows={4}
            className="mt-1 w-full bg-[#1e1f22] border border-[#3f4147] text-white rounded px-3 py-2 resize-y text-sm font-mono"
          />
          <p className="text-[10px] text-[#80848E] mt-1">
            JSON body with variable interpolation support
          </p>
        </div>
      )}

      <div className="pt-2 border-t border-[#3f4147]">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-[#b5bac1]">Headers</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addHeader}
            className="h-6 text-xs border-[#5865F2]/50 text-[#5865F2] hover:bg-[#5865F2]/20"
          >
            + Add Header
          </Button>
        </div>
        {Object.keys(headers).length === 0 ? (
          <p className="text-xs text-[#b5bac1] italic">No custom headers</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <Input
                  value={key}
                  onChange={(e) => updateHeaderKey(key, e.target.value)}
                  placeholder="Header-Name"
                  className="flex-1 bg-[#1e1f22] border-[#3f4147] text-white text-sm h-8"
                />
                <Input
                  value={value}
                  onChange={(e) => updateHeaderValue(key, e.target.value)}
                  placeholder="value"
                  className="flex-1 bg-[#1e1f22] border-[#3f4147] text-white text-sm h-8"
                />
                <button
                  type="button"
                  onClick={() => removeHeader(key)}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-[#3f4147] space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-xs text-[#b5bac1]">Timeout (ms)</Label>
            <Input
              type="number"
              min={1000}
              max={60000}
              value={action.timeout || 30000}
              onChange={(e) => onChange({ ...action, timeout: parseInt(e.target.value) || 30000 })}
              className="mt-1 bg-[#1e1f22] border-[#3f4147] text-white"
            />
          </div>
        </div>

        <DiscordCheckbox
          checked={action.retryOnFailure || false}
          onChange={(v) => onChange({ ...action, retryOnFailure: v })}
          label="Retry on Failure"
          description="Retry the request if it fails (4xx/5xx)"
          size="sm"
        />

        {action.retryOnFailure && (
          <div>
            <Label className="text-xs text-[#b5bac1]">Max Retries</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={action.retryCount || 3}
              onChange={(e) => onChange({ ...action, retryCount: parseInt(e.target.value) || 3 })}
              className="mt-1 w-24 bg-[#1e1f22] border-[#3f4147] text-white"
            />
          </div>
        )}
      </div>
    </div>
  );
}
