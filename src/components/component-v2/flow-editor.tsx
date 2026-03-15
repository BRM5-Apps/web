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
} from "./types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID();
}

function makeAction(type: FlowActionType): FlowAction {
  switch (type) {
    case "do_nothing":
      return { id: uid(), type: "do_nothing" };
    case "wait":
      return { id: uid(), type: "wait", seconds: 5 };
    case "check":
      return {
        id: uid(),
        type: "check",
        functionId: undefined,
        passBranch: [],
        failBranch: [],
      };
    case "add_role":
      return { id: uid(), type: "add_role", roleId: undefined };
    case "remove_role":
      return { id: uid(), type: "remove_role", roleId: undefined };
    case "toggle_role":
      return { id: uid(), type: "toggle_role", roleId: undefined };
    case "send_output":
      return {
        id: uid(),
        type: "send_output",
        outputKind: "message",
        templateId: undefined,
        templateType: undefined,
        hidden: false,
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
    case "stop":
      return {
        id: uid(),
        type: "stop",
        content: "",
        hidden: false,
        silent: false,
        hideEmbeds: false,
      };
  }
}

function actionLabel(action: FlowAction): string {
  switch (action.type) {
    case "do_nothing":
      return "Do Nothing";
    case "wait":
      return `Wait ${action.seconds}s`;
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
    case "create_thread":
      return "Create Thread";
    case "set_variable":
      return "Set Variable";
    case "delete_message":
      return "Delete Message";
    case "stop":
      return "Stop";
  }
}

function computeErrors(actions: FlowAction[]): string[] {
  const errors: string[] = [];
  actions.forEach((action, idx) => {
    if (
      (action.type === "add_role" ||
        action.type === "remove_role" ||
        action.type === "toggle_role") &&
      !action.roleId
    ) {
      errors.push(`Required (actions.${idx}.roleId)`);
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

const ACTION_TYPES: { type: FlowActionType; label: string }[] = [
  { type: "do_nothing", label: "Do nothing" },
  { type: "wait", label: "Wait for X seconds" },
  { type: "check", label: "Check" },
  { type: "add_role", label: "Add role" },
  { type: "remove_role", label: "Remove role" },
  { type: "toggle_role", label: "Toggle role" },
  { type: "send_output", label: "Send output" },
  { type: "create_thread", label: "Create thread" },
  { type: "set_variable", label: "Set variable" },
  { type: "delete_message", label: "Delete message" },
  { type: "stop", label: "Stop" },
];

// ── SendOutputFields ──────────────────────────────────────────────────────────

interface SendOutputFieldsProps {
  action: FaSendOutput;
  onChange: (updated: FlowAction) => void;
  factionId?: string;
}

function SendOutputFields({ action, onChange, factionId }: SendOutputFieldsProps) {
  const templates = useAllTemplates(factionId ?? "");

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
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={action.hidden}
            onChange={(e) => onChange({ ...action, hidden: e.target.checked })}
            className="accent-[#5865F2]"
          />
          Hidden (ephemeral)
        </label>
      )}
    </div>
  );
}

// ── ActionFields ──────────────────────────────────────────────────────────────

interface ActionFieldsProps {
  action: FlowAction;
  onChange: (updated: FlowAction) => void;
  factionId?: string;
}

function ActionFields({ action, onChange, factionId }: ActionFieldsProps) {
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
          onClick={() => onChange({ ...a, seconds: Math.max(1, a.seconds - 1) })}
          className="flex h-7 w-7 items-center justify-center rounded bg-[#1e1f22] border border-[#3f4147] text-white hover:bg-[#3f4147]"
        >
          −
        </button>
        <span className="min-w-[3rem] text-center text-sm text-white">
          {a.seconds}s
        </span>
        <button
          type="button"
          onClick={() => onChange({ ...a, seconds: a.seconds + 1 })}
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
      <div className="space-y-2">
        <select
          value={a.functionId ?? ""}
          onChange={(e) =>
            onChange({ ...a, functionId: e.target.value || undefined })
          }
          className="w-full rounded bg-[#1e1f22] border border-[#3f4147] px-2 py-1.5 text-sm text-gray-300 outline-none"
        >
          <option value="">Select function…</option>
        </select>
        <div className="h-px bg-[#3f4147]" />
        <div className="rounded bg-[#1e1f22] border border-[#3f4147] p-2 text-xs text-gray-400">
          <p className="font-medium text-gray-300 mb-1">If passes →</p>
          <button
            type="button"
            className="text-[#5865F2] hover:underline text-xs"
            onClick={() => {}}
          >
            + Add Action
          </button>
          {a.passBranch.length === 0 && (
            <p className="mt-1 italic text-gray-500">No actions</p>
          )}
        </div>
        <div className="rounded bg-[#1e1f22] border border-[#3f4147] p-2 text-xs text-gray-400">
          <p className="font-medium text-gray-300 mb-1">Otherwise →</p>
          <button
            type="button"
            className="text-[#5865F2] hover:underline text-xs"
            onClick={() => {}}
          >
            + Add Action
          </button>
          {a.failBranch.length === 0 && (
            <p className="mt-1 italic text-gray-500">No actions</p>
          )}
        </div>
      </div>
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
        value={a.roleId ?? ""}
        onChange={(e) =>
          onChange({ ...a, roleId: e.target.value || undefined } as FlowAction)
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
        factionId={factionId}
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
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={a.hidden}
              onChange={(e) => onChange({ ...a, hidden: e.target.checked })}
              className="accent-[#5865F2]"
            />
            Hidden (ephemeral)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={a.silent}
              onChange={(e) => onChange({ ...a, silent: e.target.checked })}
              className="accent-[#5865F2]"
            />
            Silent
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={a.hideEmbeds}
              onChange={(e) => onChange({ ...a, hideEmbeds: e.target.checked })}
              className="accent-[#5865F2]"
            />
            Hide embeds
          </label>
        </div>
      </div>
    );
  }

  return null;
}

// ── AddActionDropdown ─────────────────────────────────────────────────────────

interface AddActionDropdownProps {
  onAdd: (type: FlowActionType) => void;
}

function AddActionDropdown({ onAdd }: AddActionDropdownProps) {
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
  factionId?: string;
}

function ActionCard({
  action,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  factionId,
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
      <ActionFields action={action} onChange={onChange} factionId={factionId} />
    </div>
  );
}

// ── FlowEditor ────────────────────────────────────────────────────────────────

interface FlowEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: FlowAction[];
  onChange: (actions: FlowAction[]) => void;
  factionId?: string;
}

export function FlowEditor({
  open,
  onOpenChange,
  actions,
  onChange,
  factionId,
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
              factionId={factionId}
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
