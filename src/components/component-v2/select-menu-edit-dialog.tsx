"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronUp, ChevronDown, Copy, Trash2 } from "lucide-react";
import { FlowEditor } from "./flow-editor";
import type { C2SelectMenu, SelectOption, FlowAction } from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID();
}

function makeOption(): SelectOption {
  return {
    id: uid(),
    emoji: undefined,
    label: "",
    description: undefined,
    value: uid().replace(/-/g, "").slice(0, 10),
    default: false,
    flow: [],
  };
}

const SNOWFLAKE_RE = /^\d{17,23}$/;

// ── EmojiButton ───────────────────────────────────────────────────────────────

interface EmojiButtonProps {
  value?: string;
  onChange: (v: string | undefined) => void;
}

function EmojiButton({ value, onChange }: EmojiButtonProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  function commit() {
    const trimmed = draft.trim();
    onChange(trimmed || undefined);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commit(); }
            if (e.key === "Escape") { setDraft(value ?? ""); setEditing(false); }
          }}
          className="w-16 rounded border border-[#3f4147] bg-[#1e1f22] px-1.5 py-1 text-sm text-center text-white outline-none"
          placeholder="😀"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      title="Set emoji"
      onClick={() => { setDraft(value ?? ""); setEditing(true); }}
      className="flex h-8 w-8 items-center justify-center rounded border border-[#3f4147] bg-[#1e1f22] hover:bg-[#3f4147] transition-colors text-base flex-shrink-0"
    >
      {value ? (
        <span>{value}</span>
      ) : (
        <span className="opacity-30 text-sm">👏</span>
      )}
    </button>
  );
}

// ── OptionCard ────────────────────────────────────────────────────────────────

interface OptionCardProps {
  option: SelectOption;
  index: number;
  total: number;
  onChange: (updated: SelectOption) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  factionId?: string;
}

function OptionCard({
  option,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  factionId,
}: OptionCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);

  const labelMissing = option.label.trim() === "";
  const valueMissing = option.value.trim() === "";

  return (
    <>
      <div className="rounded border border-[#3f4147] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#1e1f22] px-2 py-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="text-gray-400 hover:text-white flex-shrink-0"
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  !collapsed && "rotate-90"
                )}
              />
            </button>
            <span className="text-xs text-gray-300 truncate">
              {option.emoji && <span className="mr-1">{option.emoji}</span>}
              {option.label || <span className="italic text-gray-500">Untitled option</span>}
            </span>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              type="button"
              disabled={index === 0}
              onClick={onMoveUp}
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]",
                index === 0 && "opacity-40 cursor-not-allowed"
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
                "flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]",
                index === total - 1 && "opacity-40 cursor-not-allowed"
              )}
              title="Move down"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={onDuplicate}
              className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]"
              title="Duplicate"
            >
              <Copy className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-red-400 hover:bg-[#3f4147]"
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Body */}
        {!collapsed && (
          <div className="p-2.5 space-y-2.5 bg-[#313338]">
            {/* Emoji + Label row */}
            <div className="flex items-start gap-2">
              <EmojiButton
                value={option.emoji}
                onChange={(v) => onChange({ ...option, emoji: v })}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">
                    Label <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-600">
                    {option.label.length}/100
                  </span>
                </div>
                <input
                  value={option.label}
                  onChange={(e) =>
                    onChange({ ...option, label: e.target.value.slice(0, 100) })
                  }
                  placeholder="Option label"
                  className={cn(
                    "w-full rounded border bg-[#1e1f22] px-2 py-1 text-sm text-white outline-none placeholder:text-gray-600",
                    labelMissing
                      ? "border-red-500/60"
                      : "border-[#3f4147] focus:border-[#5865F2]"
                  )}
                />
              </div>
            </div>

            {/* Default checkbox */}
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={option.default}
                onChange={(e) =>
                  onChange({ ...option, default: e.target.checked })
                }
                className="accent-[#5865F2]"
              />
              Default (pre-selected)
            </label>

            {/* Description */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">Description</label>
                <span className="text-xs text-gray-600">
                  {(option.description ?? "").length}/100
                </span>
              </div>
              <input
                value={option.description ?? ""}
                onChange={(e) =>
                  onChange({
                    ...option,
                    description: e.target.value.slice(0, 100) || undefined,
                  })
                }
                placeholder="Optional description"
                className="w-full rounded border border-[#3f4147] focus:border-[#5865F2] bg-[#1e1f22] px-2 py-1 text-sm text-white outline-none placeholder:text-gray-600"
              />
            </div>

            {/* Value + Edit Flow */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">
                  Value (hidden) <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-600">
                  {option.value.length}/100
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  value={option.value}
                  onChange={(e) =>
                    onChange({ ...option, value: e.target.value.slice(0, 100) })
                  }
                  placeholder="option_value"
                  className={cn(
                    "flex-1 rounded border bg-[#1e1f22] px-2 py-1 text-sm font-mono outline-none",
                    valueMissing
                      ? "border-red-500/60 text-white"
                      : "border-[#3f4147] focus:border-[#5865F2] text-[#72767d] focus:text-white"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setFlowOpen(true)}
                  className="flex-shrink-0 rounded bg-[#5865F2] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#4752c4] transition-colors"
                >
                  Edit Flow
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <FlowEditor
        open={flowOpen}
        onOpenChange={setFlowOpen}
        actions={option.flow}
        onChange={(flow: FlowAction[]) => onChange({ ...option, flow })}
        factionId={factionId}
      />
    </>
  );
}

// ── CustomSelectBody ──────────────────────────────────────────────────────────

interface CustomSelectBodyProps {
  options: SelectOption[];
  onChange: (options: SelectOption[]) => void;
  factionId?: string;
}

function CustomSelectBody({ options, onChange, factionId }: CustomSelectBodyProps) {
  function updateOption(idx: number, updated: SelectOption) {
    onChange(options.map((o, i) => (i === idx ? updated : o)));
  }

  function moveOption(idx: number, dir: -1 | 1) {
    const next = [...options];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  function duplicateOption(idx: number) {
    const copy: SelectOption = { ...options[idx], id: uid() };
    const next = [...options];
    next.splice(idx + 1, 0, copy);
    onChange(next);
  }

  function deleteOption(idx: number) {
    onChange(options.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-2">
      {options.length === 0 && (
        <p className="text-xs italic text-gray-500 text-center py-2">
          No options yet — add one below
        </p>
      )}
      {options.map((option, idx) => (
        <OptionCard
          key={option.id}
          option={option}
          index={idx}
          total={options.length}
          onChange={(updated) => updateOption(idx, updated)}
          onMoveUp={() => moveOption(idx, -1)}
          onMoveDown={() => moveOption(idx, 1)}
          onDuplicate={() => duplicateOption(idx)}
          onDelete={() => deleteOption(idx)}
          factionId={factionId}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange([...options, makeOption()])}
        className="w-full rounded bg-[#5865F2] hover:bg-[#4752c4] transition-colors px-3 py-1.5 text-sm font-medium text-white"
      >
        + Add Option
      </button>
    </div>
  );
}

// ── SnowflakeBody ─────────────────────────────────────────────────────────────

interface SnowflakeBodyProps {
  defaultValues: string[];
  flow: FlowAction[];
  onChange: (patch: { defaultValues?: string[]; flow?: FlowAction[] }) => void;
  factionId?: string;
}

function SnowflakeBody({ defaultValues, flow, onChange, factionId }: SnowflakeBodyProps) {
  const [flowOpen, setFlowOpen] = useState(false);

  function updateId(idx: number, value: string) {
    onChange({
      defaultValues: defaultValues.map((v, i) => (i === idx ? value : v)),
    });
  }

  function removeId(idx: number) {
    onChange({ defaultValues: defaultValues.filter((_, i) => i !== idx) });
  }

  return (
    <div className="space-y-2">
      {defaultValues.map((val, idx) => {
        const invalid = val !== "" && !SNOWFLAKE_RE.test(val);
        return (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={val}
              onChange={(e) => updateId(idx, e.target.value)}
              placeholder="Discord ID (17-23 digits)"
              className={cn(
                "flex-1 rounded border bg-[#1e1f22] px-2 py-1.5 text-sm text-white font-mono outline-none",
                invalid
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-[#3f4147] focus:border-[#5865F2]"
              )}
            />
            <button
              type="button"
              onClick={() => removeId(idx)}
              className="flex h-7 w-7 items-center justify-center rounded border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
              title="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange({ defaultValues: [...defaultValues, ""] })}
          className="flex-1 rounded border border-[#3f4147] bg-[#1e1f22] hover:bg-[#3f4147] transition-colors px-3 py-1.5 text-xs font-medium text-gray-300"
        >
          + Add Default Value
        </button>
        <button
          type="button"
          onClick={() => setFlowOpen(true)}
          className="flex-1 rounded border border-[#3f4147] bg-[#1e1f22] hover:bg-[#3f4147] transition-colors px-3 py-1.5 text-xs font-medium text-gray-300"
        >
          Edit Flow
        </button>
      </div>

      <FlowEditor
        open={flowOpen}
        onOpenChange={setFlowOpen}
        actions={flow}
        onChange={(updated: FlowAction[]) => onChange({ flow: updated })}
        factionId={factionId}
      />
    </div>
  );
}

// ── SelectMenuEditDialog ──────────────────────────────────────────────────────

export interface SelectMenuEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu: C2SelectMenu;
  onChange: (updated: C2SelectMenu) => void;
  factionId?: string;
}

const MENU_TYPE_LABELS: Record<C2SelectMenu["menuType"], string> = {
  select: "Select Menu",
  user_select: "User Select Menu",
  role_select: "Role Select Menu",
  user_role_select: "User & Role Select Menu",
  channel_select: "Channel Select Menu",
};

export function SelectMenuEditDialog({
  open,
  onOpenChange,
  menu,
  onChange,
  factionId,
}: SelectMenuEditDialogProps) {
  // Local draft — only committed on Save
  const [draft, setDraft] = useState<C2SelectMenu>(menu);

  // Re-sync when dialog opens with fresh data
  useEffect(() => {
    if (open) setDraft(menu);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function save() {
    onChange(draft);
    onOpenChange(false);
  }

  const isCustomSelect = draft.menuType === "select";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#2b2d31] border-[#3f4147] text-white max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-[#3f4147] flex-shrink-0">
          <DialogTitle className="text-base font-semibold text-white">
            {MENU_TYPE_LABELS[draft.menuType]}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
          {/* ── Common header ── */}
          <div className="space-y-3">
            {/* Placeholder */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-300">
                  Placeholder
                </label>
                <span className="text-xs text-gray-600">
                  {draft.placeholder.length}/150
                </span>
              </div>
              <input
                value={draft.placeholder}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    placeholder: e.target.value.slice(0, 150),
                  }))
                }
                placeholder="Make a selection"
                className="w-full rounded border border-[#3f4147] focus:border-[#5865F2] bg-[#1e1f22] px-3 py-1.5 text-sm text-white outline-none placeholder:text-gray-600"
              />
            </div>

            {/* Disabled */}
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.disabled}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, disabled: e.target.checked }))
                }
                className="accent-[#5865F2]"
              />
              Disabled
            </label>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-[#3f4147]" />

          {/* ── Type-specific body ── */}
          {isCustomSelect ? (
            <CustomSelectBody
              options={draft.options}
              onChange={(options) => setDraft((d) => ({ ...d, options }))}
              factionId={factionId}
            />
          ) : (
            <SnowflakeBody
              defaultValues={draft.defaultValues}
              flow={draft.flow}
              onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
              factionId={factionId}
            />
          )}
        </div>

        <DialogFooter className="px-4 py-3 border-t border-[#3f4147] flex-shrink-0 flex justify-center">
          <Button
            onClick={save}
            className="bg-[#5865F2] hover:bg-[#4752c4] text-white px-8"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
