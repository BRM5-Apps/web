"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronUp, ChevronDown, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiscordCheckbox } from "@/components/shared/discord-checkbox";
import { useAllTemplates } from "@/hooks/use-templates";
import type {
  FlowAction,
  FlowActionType,
  FaWait,
  FaCheck,
  FaAddRole,
  FaRemoveRole,
  FaToggleRole,
  FaSendOutput,
  FaCreateThread,
  FaSetVariable,
  FaDeleteMessage,
  FaStop,
  SendOutputKind,
  SendOutputTemplateType,
  FaRoleAction,
  FaVoiceAction,
  FaChannelAction,
  FaMessageAction,
  FaThreadAction,
  FaModerationAction,
  FaDataAction,
  FaFlowControl,
  FaWaitUntil,
} from "./types";
import {
  RoleActionFields,
  VoiceActionFields,
  ChannelActionFields,
  MessageActionFields,
  ThreadActionFields,
  ModerationActionFields,
  DataActionFields,
  FlowControlFields,
  WaitUntilFields,
} from "./consolidated-action-fields";

// Re-export uid for nested action handling
export { uid };


// ── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID();
}

export function makeAction(type: FlowActionType): FlowAction {
  switch (type) {
    case "do_nothing":
      return { id: uid(), type: "do_nothing" };
    case "wait":
      return { id: uid(), type: "wait", duration: 5, unit: "seconds" };
    case "check":
      return {
        id: uid(),
        type: "check",
        functionId: undefined,
        passBranch: [],
        failBranch: [],
      };
    case "add_role":
      return { id: uid(), type: "add_role", roleIds: [] };
    case "remove_role":
      return { id: uid(), type: "remove_role", roleIds: [] };
    case "toggle_role":
      return { id: uid(), type: "toggle_role", roleIds: [] };
    case "send_output":
      return {
        id: uid(),
        type: "send_output",
        outputKind: "message",
        templateId: undefined,
        templateType: undefined,
        channelId: undefined,
        hidden: false,
      };
    case "send_to_channel":
      return {
        id: uid(),
        type: "send_to_channel",
        channelId: "",
        templateId: undefined,
        templateType: undefined,
      };
    case "dm_user":
      return {
        id: uid(),
        type: "dm_user",
        templateId: undefined,
        templateType: undefined,
        fallbackOnError: false,
        fallbackChannelId: undefined,
      };
    case "log_to_channel":
      return {
        id: uid(),
        type: "log_to_channel",
        channelId: "",
        level: "info",
        content: "",
        includeContext: true,
      };
    case "create_thread":
      return {
        id: uid(),
        type: "create_thread",
        channelId: undefined,
        name: "",
        threadType: undefined,
        autoArchive: undefined,
      };
    case "set_variable":
      return {
        id: uid(),
        type: "set_variable",
        varType: "Static",
        varName: "",
        value: "",
      };
    case "delete_message":
      return { id: uid(), type: "delete_message", messageId: undefined };
    case "cooldown":
      return {
        id: uid(),
        type: "cooldown",
        key: "default",
        duration: 5,
        unit: "minutes",
        bypassRoles: [],
      };
    case "webhook_call":
      return {
        id: uid(),
        type: "webhook_call",
        url: "",
        method: "POST",
        headers: {},
        body: undefined,
        timeout: 30000,
        retryOnFailure: false,
        retryCount: 3,
      };
    case "stop":
      return {
        id: uid(),
        type: "stop",
        content: "",
        hidden: false,
        silent: false,
        hideEmbeds: false,
      };
    // Consolidated actions
    case "role_action":
      return {
        id: uid(),
        type: "role_action",
        operation: "add" as const,
        roleIds: [],
      };
    case "nickname_action":
      return {
        id: uid(),
        type: "nickname_action",
        operation: "set_nickname" as const,
        nickname: undefined,
        targetUserId: undefined,
      };
    case "voice_action":
      return {
        id: uid(),
        type: "voice_action",
        operation: "move" as const,
        targetChannelId: undefined,
        targetUserId: undefined,
        reason: undefined,
      };
    case "channel_action":
      return {
        id: uid(),
        type: "channel_action",
        operation: "create" as const,
        channelName: "",
        channelType: "text" as const,
      };
    case "message_action":
      return {
        id: uid(),
        type: "message_action",
        operation: "send_output" as const,
        sendAs: "channel" as const,
        templateId: undefined,
        templateType: "text" as const,
      };
    case "moderation_action":
      return {
        id: uid(),
        type: "moderation_action",
        operation: "kick" as const,
        targetUserId: undefined,
        reason: undefined,
      };
    case "data_action":
      return {
        id: uid(),
        type: "data_action",
        operation: "set" as const,
        varName: "",
        value: undefined,
      };
    case "flow_control":
      return {
        id: uid(),
        type: "flow_control",
        operation: "loop" as const,
        iterations: 1,
        loopActions: [],
      };
    case "wait_until":
      return {
        id: uid(),
        type: "wait_until",
        timestamp: undefined,
        condition: undefined,
        maxWait: 300,
        checkInterval: 10,
      };
    case "thread_action":
      return {
        id: uid(),
        type: "thread_action",
        operation: "create" as const,
        channelId: undefined,
        name: "",
        threadType: "public" as const,
        autoArchive: 60,
      };
    case "modal_action":
      return {
        id: uid(),
        type: "modal_action",
        operation: "show" as const,
      };
    case "roblox_verify":
      return {
        id: uid(),
        type: "roblox_verify",
        requireVerified: false,
        assignRoleOnVerify: undefined,
        skipIfVerified: true,
      };
  }
}

export function actionLabel(action: FlowAction): string {
  switch (action.type) {
    case "do_nothing":
      return "Do Nothing";
    case "wait":
      return `Wait ${action.duration}${action.unit === "seconds" ? "s" : action.unit === "minutes" ? "m" : "h"}`;
    case "check":
      return "Check";
    case "add_role":
      return "Add Role";
    case "remove_role":
      return "Remove Role";
    case "toggle_role":
      return "Toggle Role";
    case "send_output":
      return action.outputKind === "modal" ? "Send Output (Modal)" : "Send Output (Message)";
    case "send_to_channel":
      return "Send to Channel";
    case "dm_user":
      return "DM User";
    case "log_to_channel":
      return `Log (${action.level})`;
    case "create_thread":
      return "Create Thread";
    case "set_variable":
      return "Set Variable";
    case "delete_message":
      return "Delete Message";
    case "cooldown":
      return `Cooldown ${action.duration}${action.unit === "seconds" ? "s" : action.unit === "minutes" ? "m" : "h"}`;
    case "webhook_call":
      return `Webhook ${action.method}`;
    case "stop":
      return "Stop";
    // Consolidated actions
    case "role_action": {
      const opLabels: Record<string, string> = {
        add: "Add Role",
        remove: "Remove Role",
        toggle: "Toggle Role",
        add_temporary: "Temp Role",
      };
      return opLabels[action.operation] || "Role Action";
    }
    case "nickname_action": {
      const opLabels: Record<string, string> = {
        set_nickname: "Set Nickname",
        reset_nickname: "Reset Nickname",
      };
      return opLabels[action.operation] || "Nickname Action";
    }
    case "voice_action": {
      const opLabels: Record<string, string> = {
        move: "Move to Voice",
        disconnect: "Disconnect Voice",
        mute: "Mute",
        deafen: "Deafen",
        unmute: "Unmute",
        undeafen: "Undeafen",
      };
      return opLabels[action.operation] || "Voice Action";
    }
    case "channel_action": {
      const opLabels: Record<string, string> = {
        create: "Create Channel",
        delete: "Delete Channel",
        edit: "Edit Channel",
        lock: "Lock Channel",
        unlock: "Unlock Channel",
        slow_mode: "Set Slow Mode",
        clear_slow_mode: "Clear Slow Mode",
        archive_thread: "Archive Thread",
      };
      return opLabels[action.operation] || "Channel Action";
    }
    case "message_action": {
      const opLabels: Record<string, string> = {
        send_output: "Send Output",
        edit_message: "Edit Message",
        delete: "Delete Message",
        pin: "Pin Message",
        unpin: "Unpin Message",
        react: "Add Reaction",
      };
      return opLabels[action.operation] || "Message Action";
    }
    case "moderation_action": {
      const opLabels: Record<string, string> = {
        kick: "Kick User",
        ban: "Ban User",
        unban: "Unban User",
        timeout: "Timeout User",
        remove_timeout: "Remove Timeout",
        warn: "Warn User",
        clear_warnings: "Clear Warnings",
        quarantine: "Quarantine User",
      };
      return opLabels[action.operation] || "Moderation";
    }
    case "data_action": {
      const opLabels: Record<string, string> = {
        increment: "Increment",
        decrement: "Decrement",
        append: "Append",
        remove: "Remove",
        set: "Set Variable",
        random_number: "Random Number",
        random_choice: "Random Choice",
      };
      return opLabels[action.operation] || "Data Action";
    }
    case "flow_control": {
      const opLabels: Record<string, string> = {
        loop: "Loop",
        parallel: "Parallel",
        try_catch: "Try/Catch",
        subflow: "Call Subflow",
        return: "Return",
        break: "Break",
        continue: "Continue",
        retry: "Retry",
      };
      return opLabels[action.operation] || "Flow Control";
    }
    case "wait_until":
      return "Wait Until";
    case "thread_action": {
      const opLabels: Record<string, string> = {
        create: "Create Thread",
        archive: "Archive Thread",
        delete: "Delete Thread",
      };
      return opLabels[action.operation] || "Thread Action";
    }
    case "modal_action": {
      const opLabels: Record<string, string> = {
        show: "Show Modal",
        update: "Update Modal",
        close: "Close Modal",
      };
      return opLabels[action.operation] || "Modal Action";
    }
    default:
      return "Unknown Action";
  }
}

export function computeErrors(actions: FlowAction[]): string[] {
  const errors: string[] = [];
  actions.forEach((action, idx) => {
    if (
      (action.type === "add_role" ||
        action.type === "remove_role" ||
        action.type === "toggle_role") &&
      !action.roleIds?.length
    ) {
      errors.push(`Required (actions.${idx}.roleIds)`);
    }
    if (action.type === "create_thread" && !action.name.trim()) {
      errors.push(`Required (actions.${idx}.name)`);
    }
    if (action.type === "set_variable" && !action.varName.trim()) {
      errors.push(`Required (actions.${idx}.varName)`);
    }
  });
  return errors;
}

// ── ACTION_TYPES ─────────────────────────────────────────────────────────────

import { ALL_ACTIONS, type ActionDefinition } from "@/components/shared/action-definitions";

// Actions available in button/modal flows
export const ACTION_TYPES: { type: FlowActionType; label: string }[] = ALL_ACTIONS
  .filter(a => a.availableInFlow)
  .map(a => ({ type: a.type as FlowActionType, label: a.label }));

// ── SendOutputFields ──────────────────────────────────────────────────────────

interface SendOutputFieldsProps {
  action: FaSendOutput;
  onChange: (updated: FlowAction) => void;
  serverId?: string;
}

function SendOutputFields({ action, onChange, serverId }: SendOutputFieldsProps) {
  const templates = useAllTemplates(serverId ?? "");

  // Groups: only show modal group when outputKind === "modal", else show text/embed/container
  const groups: { kind: SendOutputTemplateType; label: string; items: { id: string; name: string }[] }[] =
    action.outputKind === "modal"
      ? [{ kind: "modal", label: "Modals", items: templates.modals }]
      : [
          { kind: "text", label: "Text Templates", items: templates.texts },
          { kind: "embed", label: "Embed Templates", items: templates.embeds },
          { kind: "container", label: "Container Templates", items: templates.containers },
        ];

  const allFiltered = groups.flatMap((g) => g.items.map((t) => ({ ...t, kind: g.kind })));

  function handleKindChange(kind: SendOutputKind) {
    onChange({ ...action, outputKind: kind, templateId: undefined, templateType: undefined });
  }

  function handleTemplateChange(id: string) {
    const found = allFiltered.find((t) => t.id === id);
    onChange({
      ...action,
      templateId: id || undefined,
      templateType: found?.kind ?? undefined,
    });
  }

  const hasTemplates = allFiltered.length > 0;

  return (
    <div className="space-y-2">
      {/* Output kind toggle */}
      <div className="flex rounded overflow-hidden border border-[#3f4147]">
        {(["message", "modal"] as SendOutputKind[]).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => handleKindChange(kind)}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium capitalize transition-colors",
              action.outputKind === kind
                ? "bg-[#5865F2] text-white"
                : "bg-[#1e1f22] text-gray-400 hover:text-white"
            )}
          >
            {kind}
          </button>
        ))}
      </div>

      {/* Template selector */}
      <Select
        value={action.templateId ?? ""}
        onValueChange={handleTemplateChange}
        disabled={templates.isLoading || !hasTemplates}
      >
        <SelectTrigger className="w-full bg-[#1e1f22] border-[#3f4147] text-gray-300 focus:ring-[#5865F2] focus:ring-offset-0">
          <SelectValue
            placeholder={
              templates.isLoading
                ? "Loading templates…"
                : !hasTemplates
                ? `No ${action.outputKind === "modal" ? "modal" : "message"} templates saved yet`
                : "Choose a template…"
            }
          />
        </SelectTrigger>
        <SelectContent className="bg-[#2b2d31] border-[#3f4147] text-white">
          {groups.map((group) =>
            group.items.length > 0 ? (
              <SelectGroup key={group.kind}>
                <div className="px-2 py-1 text-xs text-gray-400 font-medium">{group.label}</div>
                {group.items.map((t) => (
                  <SelectItem
                    key={t.id}
                    value={t.id}
                    className="focus:bg-[#5865F2] focus:text-white cursor-pointer"
                  >
                    {t.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ) : null
          )}
        </SelectContent>
      </Select>

      {/* Hidden (ephemeral) — only relevant for messages */}
      {action.outputKind === "message" && (
        <DiscordCheckbox
          checked={action.hidden}
          onChange={(v) => onChange({ ...action, hidden: v })}
          label="Hidden (ephemeral)"
          size="sm"
        />
      )}
    </div>
  );
}

// ── ActionFields ──────────────────────────────────────────────────────────────

interface ActionFieldsProps {
  action: FlowAction;
  onChange: (updated: FlowAction) => void;
  serverId?: string;
}

export function ActionFields({ action, onChange, serverId }: ActionFieldsProps) {
  if (action.type === "do_nothing") {
    return (
      <p className="text-xs text-gray-400">No configuration needed.</p>
    );
  }

  if (action.type === "wait") {
    const a = action as FaWait;
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...a, duration: Math.max(1, a.duration - 1) })}
          className="flex h-7 w-7 items-center justify-center rounded bg-[#1e1f22] border border-[#3f4147] text-white hover:bg-[#3f4147]"
        >
          −
        </button>
        <span className="min-w-[3rem] text-center text-sm text-white">
          {a.duration}s
        </span>
        <button
          type="button"
          onClick={() => onChange({ ...a, duration: a.duration + 1 })}
          className="flex h-7 w-7 items-center justify-center rounded bg-[#1e1f22] border border-[#3f4147] text-white hover:bg-[#3f4147]"
        >
          +
        </button>
      </div>
    );
  }

  if (action.type === "check") {
    const a = action as FaCheck;
    return (
      <CheckActionFields action={a} onChange={onChange} />
    );
  }

  if (
    action.type === "add_role" ||
    action.type === "remove_role" ||
    action.type === "toggle_role"
  ) {
    const a = action as FaAddRole | FaRemoveRole | FaToggleRole;
    return (
      <select
        value={a.roleIds?.[0] ?? ""}
        onChange={(e) =>
          onChange({ ...a, roleIds: e.target.value ? [e.target.value] : [] } as FlowAction)
        }
        className="w-full rounded bg-[#1e1f22] border border-[#3f4147] px-2 py-1.5 text-sm text-gray-300 outline-none"
      >
        <option value="">Select role…</option>
      </select>
    );
  }

  if (action.type === "send_output") {
    return (
      <SendOutputFields
        action={action as FaSendOutput}
        onChange={onChange}
        serverId={serverId}
      />
    );
  }

  if (action.type === "create_thread") {
    const a = action as FaCreateThread;
    return (
      <div className="space-y-2">
        <Input
          value={a.channelId ?? ""}
          onChange={(e) =>
            onChange({ ...a, channelId: e.target.value || undefined })
          }
          placeholder="Channel ID…"
          className="bg-[#1e1f22] border-[#3f4147] text-white"
        />
        <div className="relative">
          <Input
            value={a.name}
            onChange={(e) =>
              onChange({ ...a, name: e.target.value.slice(0, 100) })
            }
            placeholder="Thread name"
            maxLength={100}
            className="bg-[#1e1f22] border-[#3f4147] text-white pr-16"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs italic text-gray-500">
            {a.name.length}/100
          </span>
        </div>
        <select
          value={a.threadType ?? ""}
          onChange={(e) =>
            onChange({ ...a, threadType: e.target.value || undefined })
          }
          className="w-full rounded bg-[#1e1f22] border border-[#3f4147] px-2 py-1.5 text-sm text-gray-300 outline-none"
        >
          <option value="">Thread type…</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <select
          value={a.autoArchive ?? ""}
          onChange={(e) =>
            onChange({ ...a, autoArchive: e.target.value || undefined })
          }
          className="w-full rounded bg-[#1e1f22] border border-[#3f4147] px-2 py-1.5 text-sm text-gray-300 outline-none"
        >
          <option value="">Auto archive duration…</option>
          <option value="60">1 hour</option>
          <option value="1440">1 day</option>
          <option value="4320">3 days</option>
          <option value="10080">1 week</option>
        </select>
      </div>
    );
  }

  if (action.type === "set_variable") {
    const a = action as FaSetVariable;
    return (
      <div className="space-y-2">
        <select
          value={a.varType}
          onChange={(e) => onChange({ ...a, varType: e.target.value })}
          className="w-full rounded bg-[#1e1f22] border border-[#3f4147] px-2 py-1.5 text-sm text-gray-300 outline-none"
        >
          <option value="Static">Static</option>
          <option value="Dynamic">Dynamic</option>
          <option value="User">User</option>
          <option value="Guild">Guild</option>
        </select>
        <div className="relative">
          <Input
            value={a.varName}
            onChange={(e) =>
              onChange({ ...a, varName: e.target.value.slice(0, 100) })
            }
            placeholder="Variable name"
            maxLength={100}
            className="bg-[#1e1f22] border-[#3f4147] text-white pr-16"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs italic text-gray-500">
            {a.varName.length}/100
          </span>
        </div>
        <div className="relative">
          <Input
            value={a.value}
            onChange={(e) =>
              onChange({ ...a, value: e.target.value.slice(0, 500) })
            }
            placeholder="Value"
            maxLength={500}
            className="bg-[#1e1f22] border-[#3f4147] text-white pr-16"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs italic text-gray-500">
            {a.value.length}/500
          </span>
        </div>
      </div>
    );
  }

  if (action.type === "delete_message") {
    const a = action as FaDeleteMessage;
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-400">
          Deletes the message this component is attached to.
        </p>
        <Input
          value={a.messageId ?? ""}
          onChange={(e) =>
            onChange({ ...a, messageId: e.target.value || undefined })
          }
          placeholder="Override message ID…"
          className="bg-[#1e1f22] border-[#3f4147] text-white"
        />
      </div>
    );
  }

  if (action.type === "stop") {
    const a = action as FaStop;
    return (
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs text-gray-400">Content</Label>
            <span className="text-xs italic text-gray-500">
              {a.content.length}/2000
            </span>
          </div>
          <textarea
            value={a.content}
            onChange={(e) =>
              onChange({ ...a, content: e.target.value.slice(0, 2000) })
            }
            rows={3}
            placeholder="Stop message content…"
            className="w-full resize-y rounded bg-[#1e1f22] border border-[#3f4147] px-2 py-1.5 text-sm text-white placeholder:text-gray-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <DiscordCheckbox
            checked={a.hidden}
            onChange={(v) => onChange({ ...a, hidden: v })}
            label="Hidden (ephemeral)"
            size="sm"
          />
          <DiscordCheckbox
            checked={a.silent}
            onChange={(v) => onChange({ ...a, silent: v })}
            label="Silent"
            size="sm"
          />
          <DiscordCheckbox
            checked={a.hideEmbeds}
            onChange={(v) => onChange({ ...a, hideEmbeds: v })}
            label="Hide embeds"
            size="sm"
          />
        </div>
      </div>
    );
  }

  // ── Consolidated Action Field Components ─────────────────────────────────────

  // Role Action Fields
  if (action.type === "role_action") {
    return (
      <RoleActionFields
        action={action as FaRoleAction}
        onChange={onChange}
      />
    );
  }

  // Voice Action Fields
  if (action.type === "voice_action") {
    return (
      <VoiceActionFields
        action={action as FaVoiceAction}
        onChange={onChange}
      />
    );
  }

  // Channel Action Fields
  if (action.type === "channel_action") {
    return (
      <ChannelActionFields
        action={action as FaChannelAction}
        onChange={onChange}
      />
    );
  }

  // Message Action Fields
  if (action.type === "message_action") {
    return (
      <MessageActionFields
        action={action as FaMessageAction}
        onChange={onChange}
      />
    );
  }

  // Moderation Action Fields
  if (action.type === "moderation_action") {
    return (
      <ModerationActionFields
        action={action as FaModerationAction}
        onChange={onChange}
      />
    );
  }

  // Data Action Fields
  if (action.type === "data_action") {
    return (
      <DataActionFields
        action={action as FaDataAction}
        onChange={onChange}
      />
    );
  }

  // Flow Control Fields
  if (action.type === "flow_control") {
    return (
      <FlowControlFields
        action={action as FaFlowControl}
        onChange={onChange}
      />
    );
  }

  // Wait Until Fields
  if (action.type === "wait_until") {
    return (
      <WaitUntilFields
        action={action as FaWaitUntil}
        onChange={onChange}
      />
    );
  }

  return null;
}

// ── AddActionDropdown ─────────────────────────────────────────────────────────

interface AddActionDropdownProps {
  onAdd: (type: FlowActionType) => void;
}

export function AddActionDropdown({ onAdd }: AddActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[#5865F2] hover:bg-[#4752c4] text-white h-8 text-sm">
          + Add Action
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#2b2d31] border-[#3f4147] text-white">
        {ACTION_TYPES.map(({ type, label }) => (
          <DropdownMenuItem
            key={type}
            onClick={() => onAdd(type)}
            className="hover:bg-[#5865F2] cursor-pointer focus:bg-[#5865F2]"
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── CheckActionFields ───────────────────────────────────────────────────────────

interface CheckActionFieldsProps {
  action: FaCheck;
  onChange: (updated: FlowAction) => void;
}

function CheckActionFields({ action, onChange }: CheckActionFieldsProps) {
  function addActionToBranch(branch: "passBranch" | "failBranch", type: FlowActionType) {
    const newAction = makeAction(type);
    const updatedBranch = [...action[branch], newAction];
    onChange({
      ...action,
      [branch]: updatedBranch,
    });
  }

  function updateBranchAction(
    branch: "passBranch" | "failBranch",
    index: number,
    updated: FlowAction
  ) {
    const updatedBranch = action[branch].map((a, i) => (i === index ? updated : a));
    onChange({
      ...action,
      [branch]: updatedBranch,
    });
  }

  function moveBranchAction(branch: "passBranch" | "failBranch", index: number, direction: -1 | 1) {
    const arr = [...action[branch]];
    const target = index + direction;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    onChange({
      ...action,
      [branch]: arr,
    });
  }

  function duplicateBranchAction(branch: "passBranch" | "failBranch", index: number) {
    const copy = { ...action[branch][index], id: uid() };
    const updatedBranch = [...action[branch]];
    updatedBranch.splice(index + 1, 0, copy);
    onChange({
      ...action,
      [branch]: updatedBranch,
    });
  }

  function deleteBranchAction(branch: "passBranch" | "failBranch", index: number) {
    onChange({
      ...action,
      [branch]: action[branch].filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-3">
      <div className="rounded bg-[#1e1f22] border border-[#3f4147] p-2">
        <p className="font-medium text-gray-300 mb-2 text-xs">If passes →</p>
        <div className="space-y-2">
          {action.passBranch.map((branchAction, idx) => (
            <div key={branchAction.id} className="rounded border border-[#5865F2]/30 bg-[#5865F2]/5 p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white">{actionLabel(branchAction)}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveBranchAction("passBranch", idx, -1)}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]",
                      idx === 0 && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === action.passBranch.length - 1}
                    onClick={() => moveBranchAction("passBranch", idx, 1)}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]",
                      idx === action.passBranch.length - 1 && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateBranchAction("passBranch", idx)}
                    className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteBranchAction("passBranch", idx)}
                    className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-red-400 hover:bg-[#3f4147]"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <ActionFields
                action={branchAction}
                onChange={(updated) => updateBranchAction("passBranch", idx, updated)}
              />
            </div>
          ))}
          {action.passBranch.length === 0 && (
            <p className="text-xs text-gray-500 italic">No actions</p>
          )}
          <AddActionDropdown onAdd={(type) => addActionToBranch("passBranch", type)} />
        </div>
      </div>

      <div className="rounded bg-[#1e1f22] border border-[#3f4147] p-2">
        <p className="font-medium text-gray-300 mb-2 text-xs">Otherwise →</p>
        <div className="space-y-2">
          {action.failBranch.map((branchAction, idx) => (
            <div key={branchAction.id} className="rounded border border-[#5865F2]/30 bg-[#5865F2]/5 p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white">{actionLabel(branchAction)}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveBranchAction("failBranch", idx, -1)}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]",
                      idx === 0 && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === action.failBranch.length - 1}
                    onClick={() => moveBranchAction("failBranch", idx, 1)}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]",
                      idx === action.failBranch.length - 1 && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateBranchAction("failBranch", idx)}
                    className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteBranchAction("failBranch", idx)}
                    className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-red-400 hover:bg-[#3f4147]"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <ActionFields
                action={branchAction}
                onChange={(updated) => updateBranchAction("failBranch", idx, updated)}
              />
            </div>
          ))}
          {action.failBranch.length === 0 && (
            <p className="text-xs text-gray-500 italic">No actions</p>
          )}
          <AddActionDropdown onAdd={(type) => addActionToBranch("failBranch", type)} />
        </div>
      </div>
    </div>
  );
}

// ── ActionCard ────────────────────────────────────────────────────────────────

interface ActionCardProps {
  action: FlowAction;
  index: number;
  total: number;
  onChange: (updated: FlowAction) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  serverId?: string;
}

export function ActionCard({
  action,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  serverId,
}: ActionCardProps) {
  return (
    <div className="rounded-lg border border-[#5865F2]/40 bg-[#5865F2]/10 p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-white">
          {actionLabel(action)}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]",
              index === 0 && "opacity-50 cursor-not-allowed"
            )}
            title="Move up"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={onMoveDown}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]",
              index === total - 1 && "opacity-50 cursor-not-allowed"
            )}
            title="Move down"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]"
            title="Duplicate"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-red-400 hover:bg-[#3f4147]"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <ActionFields action={action} onChange={onChange} serverId={serverId} />
    </div>
  );
}

// ── FlowEditor ────────────────────────────────────────────────────────────────

interface FlowEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: FlowAction[];
  onChange: (actions: FlowAction[]) => void;
  serverId?: string;
}

export function FlowEditor({
  open,
  onOpenChange,
  actions,
  onChange,
  serverId,
}: FlowEditorProps) {
  const [localActions, setLocalActions] = useState<FlowAction[]>(actions);

  // Sync local state when dialog opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setLocalActions(actions);
    } else {
      onChange(localActions);
    }
    onOpenChange(nextOpen);
  };

  const errors = computeErrors(localActions);

  function updateAction(idx: number, updated: FlowAction) {
    setLocalActions((prev) => prev.map((a, i) => (i === idx ? updated : a)));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    setLocalActions((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  function moveDown(idx: number) {
    setLocalActions((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  function duplicate(idx: number) {
    setLocalActions((prev) => {
      const copy: FlowAction = { ...prev[idx], id: uid() };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }

  function remove(idx: number) {
    setLocalActions((prev) => prev.filter((_, i) => i !== idx));
  }

  function addAction(type: FlowActionType) {
    setLocalActions((prev) => [...prev, makeAction(type)]);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl bg-[#2b2d31] border-[#3f4147] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Actions</DialogTitle>
        </DialogHeader>

        {errors.length > 0 && (
          <div className="rounded border border-yellow-600 bg-yellow-900/30 p-3 text-sm text-yellow-300">
            <p className="font-semibold mb-1">⚠ Validation Issues</p>
            <ul className="list-disc list-inside space-y-0.5">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded border border-yellow-700/50 bg-yellow-900/20 p-2 text-xs text-yellow-200">
          ℹ Actions have a maximum of 10 non-check/stop actions
        </div>

        <div className="space-y-2">
          {localActions.map((action, idx) => (
            <ActionCard
              key={action.id}
              action={action}
              index={idx}
              total={localActions.length}
              onChange={(updated) => updateAction(idx, updated)}
              onMoveUp={() => moveUp(idx)}
              onMoveDown={() => moveDown(idx)}
              onDuplicate={() => duplicate(idx)}
              onDelete={() => remove(idx)}
              serverId={serverId}
            />
          ))}
        </div>

        <div className="flex items-center gap-4 pt-2">
          <AddActionDropdown onAdd={addAction} />
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="text-sm text-gray-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
