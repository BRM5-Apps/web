"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Copy,
  Trash2,
  GripVertical,
  X,
  FileText,
  Mail,
  User,
  Ticket,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModalTextInput {
  id: string;
  label: string;
  style: "short" | "paragraph";
  required: boolean;
  placeholder: string;
  defaultValue: string;
  description?: string;
  minLength?: number;
  maxLength?: number;
}

export interface ModalPage {
  id: string;
  name: string;
  inputs: ModalTextInput[];
}

export type OutputLocationType = "default" | "application" | "ticket";

export interface OutputLocation {
  id: string;
  type: OutputLocationType;
  channelId: string;
  mentions: string[];
  anonymise: boolean;
}

export interface ModalSettings {
  outputLimitEnabled: boolean;
  outputLimit: number;
  outputLocations: OutputLocation[];
}

export interface DiscordModalBuilderProps {
  onSave?: (pages: ModalPage[], settings: ModalSettings) => void;
  isSaving?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uid(): string {
  return crypto.randomUUID();
}

function makeInput(): ModalTextInput {
  return {
    id: uid(),
    label: "Question",
    style: "short",
    required: true,
    placeholder: "",
    defaultValue: "",
    description: "",
  };
}

function makePage(n: number): ModalPage {
  return { id: uid(), name: `Page ${n}`, inputs: [makeInput()] };
}

function makeLocation(): OutputLocation {
  return { id: uid(), type: "default", channelId: "", mentions: [], anonymise: false };
}

// ---------------------------------------------------------------------------
// MentionsInput
// ---------------------------------------------------------------------------

interface MentionsInputProps {
  value: string[];
  onChange: (mentions: string[]) => void;
  max: number;
}

function MentionsInput({ value, onChange, max }: MentionsInputProps) {
  const [draft, setDraft] = useState("");

  return (
    <div className="flex min-h-[36px] flex-wrap gap-1 rounded border border-[#3f4147] bg-[#2b2d31] px-2 py-1.5">
      {value.map((m, i) => (
        <span
          key={i}
          className="flex items-center gap-1 rounded border border-[#5865F2]/40 bg-[#5865F2]/20 px-1.5 py-0.5 text-xs text-[#5865F2]"
        >
          {m}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="hover:text-white"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      {value.length < max && (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === ",") && draft.trim()) {
              e.preventDefault();
              onChange([...value, draft.trim()]);
              setDraft("");
            }
          }}
          placeholder={value.length === 0 ? "Select roles or users" : ""}
          className="min-w-[120px] flex-1 bg-transparent text-xs text-white placeholder:text-gray-500 outline-none"
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OutputLocationCard
// ---------------------------------------------------------------------------

interface OutputLocationCardProps {
  location: OutputLocation;
  onChange: (loc: OutputLocation) => void;
  onDelete: () => void;
}

function OutputLocationCard({ location, onChange, onDelete }: OutputLocationCardProps) {
  return (
    <div className="rounded-lg border border-[#3f4147] bg-[#1e1f22] p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5865F2]">
            <span className="text-[11px] font-bold text-white">D</span>
          </div>
          <span className="text-sm font-medium text-white">Discord</span>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-gray-500 hover:text-[#f23f42] transition-colors duration-150"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Type selector */}
      <div className="mb-3">
        <p className="mb-1.5 text-xs text-gray-400">Type</p>
        <div className="flex gap-1 rounded bg-[#2b2d31] p-1">
          {(["default", "application", "ticket"] as OutputLocationType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...location, type: t })}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors duration-150",
                location.type === t
                  ? "bg-[#5865F2] text-white"
                  : "text-gray-400 hover:bg-[#3f4147] hover:text-white"
              )}
            >
              {t === "default" && <Mail className="h-3.5 w-3.5" />}
              {t === "application" && <User className="h-3.5 w-3.5" />}
              {t === "ticket" && <Ticket className="h-3.5 w-3.5" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Channel */}
      <div className="mb-3">
        <p className="mb-1 text-xs text-gray-400">
          Channel <span className="text-[#f23f42]">*</span>
        </p>
        <div className="flex items-center gap-1.5 rounded border border-[#3f4147] bg-[#2b2d31] px-2 py-1.5">
          <span className="text-sm text-gray-400">#</span>
          <input
            value={location.channelId}
            onChange={(e) => onChange({ ...location, channelId: e.target.value })}
            placeholder="channel-name or ID"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
          />
        </div>
      </div>

      {/* Mentions */}
      <div className="mb-3">
        <p className="mb-1 text-xs text-gray-400">
          Mentions ({location.mentions.length}/5)
        </p>
        <MentionsInput
          value={location.mentions}
          onChange={(m) => onChange({ ...location, mentions: m })}
          max={5}
        />
      </div>

      {/* Anonymise */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-white">Anonymise User</span>
        <Switch
          checked={location.anonymise}
          onCheckedChange={(v) => onChange({ ...location, anonymise: v })}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ModalSettingsPanel
// ---------------------------------------------------------------------------

interface ModalSettingsPanelProps {
  settings: ModalSettings;
  onChange: (settings: ModalSettings) => void;
  onAddLocation: () => void;
  onUpdateLocation: (idx: number, loc: OutputLocation) => void;
  onDeleteLocation: (idx: number) => void;
  onRoleRestrictOpen: () => void;
  onRoleOutputOpen: () => void;
}

function ModalSettingsPanel({
  settings,
  onChange,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
  onRoleRestrictOpen,
  onRoleOutputOpen,
}: ModalSettingsPanelProps) {
  return (
    <div className="space-y-4 rounded-lg border border-[#3f4147] bg-[#2b2d31] p-6">
      <h2 className="text-base font-semibold text-white">Settings</h2>

      {/* Role Restrictions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Role Restrictions</p>
          <p className="text-xs text-gray-400">Restrict which roles can trigger this modal</p>
        </div>
        <Button
          onClick={onRoleRestrictOpen}
          className="h-auto bg-[#5865F2] px-3 py-1.5 text-xs text-white hover:bg-[#4752c4]"
        >
          Configure
        </Button>
      </div>

      <Separator className="bg-[#3f4147]" />

      {/* Update User Roles on Output */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Update User Roles on Output</p>
          <p className="text-xs text-gray-400">
            Grant or remove roles when a user submits this modal
          </p>
        </div>
        <Button
          onClick={onRoleOutputOpen}
          className="h-auto bg-[#5865F2] px-3 py-1.5 text-xs text-white hover:bg-[#4752c4]"
        >
          Configure
        </Button>
      </div>

      <Separator className="bg-[#3f4147]" />

      {/* Output Limit */}
      <div className="flex items-center gap-4">
        <Switch
          checked={settings.outputLimitEnabled}
          onCheckedChange={(v) => onChange({ ...settings, outputLimitEnabled: v })}
        />
        <span className="text-sm text-white">Limit to</span>
        <input
          type="number"
          min={1}
          max={999}
          value={settings.outputLimit}
          disabled={!settings.outputLimitEnabled}
          onChange={(e) =>
            onChange({
              ...settings,
              outputLimit: Math.min(999, Math.max(1, Number(e.target.value) || 1)),
            })
          }
          className="w-16 rounded border border-[#3f4147] bg-[#1e1f22] px-2 py-1 text-center text-sm text-white outline-none disabled:opacity-40"
        />
        <span className="text-sm text-white">output per user</span>
      </div>

      <Separator className="bg-[#3f4147]" />

      {/* Output Locations */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Output Locations</p>
            <p className="text-xs text-gray-400">
              {settings.outputLocations.length}/2 locations configured
            </p>
          </div>
          {settings.outputLocations.length < 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddLocation}
              className="border-[#3f4147] text-xs text-gray-300 hover:bg-[#3f4147] hover:text-white"
            >
              + Add Location
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {settings.outputLocations.map((loc, idx) => (
            <OutputLocationCard
              key={loc.id}
              location={loc}
              onChange={(updated) => onUpdateLocation(idx, updated)}
              onDelete={() => onDeleteLocation(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ModalInputBlock
// ---------------------------------------------------------------------------

interface ModalInputBlockProps {
  input: ModalTextInput;
  index: number;
  total: number;
  onChange: (input: ModalTextInput) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function ModalInputBlock({
  input,
  index,
  total,
  onChange,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ModalInputBlockProps) {
  const [boundsOpen, setBoundsOpen] = useState(false);
  const [placeholderOpen, setPlaceholderOpen] = useState(false);

  return (
    <div className="group/input relative flex items-start gap-2">
      {/* Drag handle + move arrows */}
      <div className="mt-1 flex cursor-grab flex-col items-center gap-0.5 self-start pt-5 opacity-0 transition-opacity duration-150 group-hover/input:opacity-100">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="text-gray-500 hover:text-white disabled:opacity-30"
          title="Move up"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <GripVertical className="h-4 w-4 text-gray-500" />
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="text-gray-500 hover:text-white disabled:opacity-30"
          title="Move down"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Input content */}
      <div className="flex-1">
        {/* Label row */}
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <input
              value={input.label}
              onChange={(e) =>
                onChange({ ...input, label: e.target.value.slice(0, 45) })
              }
              maxLength={45}
              className="bg-transparent text-[13px] font-semibold text-[#b5bac1] outline-none transition-all duration-150 group-hover/input:border-b group-hover/input:border-dashed group-hover/input:border-[#5865F2]"
              placeholder="Question label"
            />
            {input.required && (
              <span className="text-[13px] text-[#f23f42]">*</span>
            )}
          </div>
          {/* Duplicate + Delete */}
          <div className="flex gap-1 opacity-0 transition-opacity duration-150 group-hover/input:opacity-100">
            <button
              type="button"
              onClick={onDuplicate}
              title="Duplicate"
              className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Delete"
              className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-[#f23f42]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        {input.description && (
          <p className="mb-1 text-[12px] text-[#b5bac1]">{input.description}</p>
        )}

        {/* The input field itself */}
        {input.style === "short" ? (
          <input
            readOnly
            value={input.defaultValue}
            placeholder={input.placeholder}
            className="w-full rounded-[3px] border border-[#1e1f22] bg-[#1e1f22] px-2 py-2 text-[14px] text-white outline-none transition-all duration-150 placeholder:text-[#87898c] group-hover/input:border-dashed group-hover/input:border-[#5865F2]"
          />
        ) : (
          <textarea
            readOnly
            value={input.defaultValue}
            placeholder={input.placeholder}
            rows={3}
            className="w-full resize-none rounded-[3px] border border-[#1e1f22] bg-[#1e1f22] px-2 py-2 text-[14px] text-white outline-none transition-all duration-150 placeholder:text-[#87898c] group-hover/input:border-dashed group-hover/input:border-[#5865F2]"
          />
        )}

        {/* Action buttons row */}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 opacity-0 transition-opacity duration-150 group-hover/input:opacity-100">
          {!input.description && (
            <button
              type="button"
              onClick={() => onChange({ ...input, description: "Enter description" })}
              className="rounded border border-[#5865F2]/40 px-2 py-0.5 text-[11px] text-[#5865F2] hover:bg-[#5865F2]/10"
            >
              + Description
            </button>
          )}
          <button
            type="button"
            onClick={() => onChange({ ...input, required: !input.required })}
            className={cn(
              "rounded border px-2 py-0.5 text-[11px] transition-colors duration-150",
              input.required
                ? "border-[#5865F2]/40 bg-[#5865F2]/10 text-[#5865F2]"
                : "border-gray-600 text-gray-400 hover:border-[#5865F2]/40 hover:text-[#5865F2]"
            )}
          >
            Required
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...input,
                style: input.style === "short" ? "paragraph" : "short",
              })
            }
            className="rounded border border-gray-600 px-2 py-0.5 text-[11px] text-gray-400 hover:border-[#5865F2]/40 hover:text-[#5865F2]"
          >
            {input.style === "short" ? "Short" : "Paragraph"}
          </button>
          <button
            type="button"
            onClick={() => setBoundsOpen(!boundsOpen)}
            className="rounded border border-gray-600 px-2 py-0.5 text-[11px] text-gray-400 hover:border-[#5865F2]/40 hover:text-[#5865F2]"
          >
            Bounds
          </button>
          <button
            type="button"
            onClick={() => setPlaceholderOpen(!placeholderOpen)}
            className="rounded border border-gray-600 px-2 py-0.5 text-[11px] text-gray-400 hover:border-[#5865F2]/40 hover:text-[#5865F2]"
          >
            Placeholder
          </button>
        </div>

        {/* Bounds inline panel */}
        {boundsOpen && (
          <div className="mt-2 flex items-center gap-3 rounded bg-[#1e1f22] p-2 text-[12px] text-gray-300">
            <label className="flex items-center gap-1">
              Min
              <input
                type="number"
                min={0}
                max={4000}
                value={input.minLength ?? ""}
                onChange={(e) =>
                  onChange({
                    ...input,
                    minLength: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="ml-1 w-16 rounded border border-[#3f4147] bg-[#2b2d31] px-1.5 py-0.5 text-white outline-none"
              />
            </label>
            <label className="flex items-center gap-1">
              Max
              <input
                type="number"
                min={1}
                max={4000}
                value={input.maxLength ?? ""}
                onChange={(e) =>
                  onChange({
                    ...input,
                    maxLength: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="ml-1 w-16 rounded border border-[#3f4147] bg-[#2b2d31] px-1.5 py-0.5 text-white outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => setBoundsOpen(false)}
              className="ml-auto text-gray-500 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Placeholder inline panel */}
        {placeholderOpen && (
          <div className="mt-2 rounded bg-[#1e1f22] p-2">
            <input
              value={input.placeholder}
              onChange={(e) =>
                onChange({ ...input, placeholder: e.target.value.slice(0, 100) })
              }
              maxLength={100}
              placeholder="Placeholder text (max 100 chars)"
              className="w-full bg-transparent text-[12px] text-white outline-none placeholder:text-gray-500"
            />
            <div className="mt-0.5 text-right text-[10px] text-gray-500">
              {input.placeholder.length}/100
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ModalPageEditor
// ---------------------------------------------------------------------------

interface ModalPageEditorProps {
  page: ModalPage;
  pageIndex: number;
  totalPages: number;
  onChange: (page: ModalPage) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddInput: () => void;
  onUpdateInput: (inputIdx: number, input: ModalTextInput) => void;
  onDuplicateInput: (inputIdx: number) => void;
  onDeleteInput: (inputIdx: number) => void;
  onMoveInput: (inputIdx: number, dir: -1 | 1) => void;
}

function ModalPageEditor({
  page,
  pageIndex,
  totalPages,
  onChange,
  onDuplicate,
  onDelete,
  onAddInput,
  onUpdateInput,
  onDuplicateInput,
  onDeleteInput,
  onMoveInput,
}: ModalPageEditorProps) {
  return (
    <div className="group relative">
      {/* Page header — visible only on group-hover */}
      <div className="mb-2 flex items-center justify-between opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <input
          value={page.name}
          onChange={(e) => onChange({ ...page, name: e.target.value })}
          className="bg-transparent text-sm font-semibold text-white outline-none"
          placeholder="Page name"
        />
        <span className="mx-2 text-xs text-gray-400">
          {page.inputs.length}/5 components
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate page"
            className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white transition-colors duration-150"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={totalPages === 1}
            title="Delete page"
            className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-[#f23f42] disabled:opacity-30 transition-colors duration-150"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Discord Modal Card */}
      <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-[4px] bg-[#313338] shadow-2xl">
        {/* Modal title bar */}
        <div className="flex items-center gap-3 px-4 pb-2 pt-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#5865F2]">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <input
            value={page.name}
            onChange={(e) => onChange({ ...page, name: e.target.value })}
            maxLength={45}
            className="flex-1 bg-transparent text-[20px] font-bold text-white outline-none transition-all duration-150 group-hover:border-b group-hover:border-dashed group-hover:border-[#5865F2]"
            placeholder="Modal Title"
          />
          <button
            type="button"
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4 px-4 py-3">
          {page.inputs.map((input, inputIdx) => (
            <ModalInputBlock
              key={input.id}
              input={input}
              index={inputIdx}
              total={page.inputs.length}
              onChange={(updated) => onUpdateInput(inputIdx, updated)}
              onDuplicate={() => onDuplicateInput(inputIdx)}
              onDelete={() => onDeleteInput(inputIdx)}
              onMoveUp={() => onMoveInput(inputIdx, -1)}
              onMoveDown={() => onMoveInput(inputIdx, 1)}
            />
          ))}
        </div>

        {/* Modal footer */}
        <div className="relative px-4 pb-4 pt-2">
          {/* Cancel/Submit always visible */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded px-4 py-2 text-sm text-white hover:underline"
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded bg-[#5865F2] px-4 py-2 text-sm font-medium text-white hover:bg-[#4752c4] transition-colors duration-150"
            >
              Submit
            </button>
          </div>
          {/* Add component overlay — overlays footer on group-hover */}
          {page.inputs.length < 5 && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <button
                type="button"
                onClick={onAddInput}
                className="w-full rounded border-2 border-dashed border-[#5865F2] py-2 text-sm text-[#5865F2] transition-colors duration-150 hover:bg-[#5865F2]/10"
              >
                + Add a component
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Page index label */}
      {pageIndex !== undefined && (
        <p className="mt-1.5 text-center text-[11px] text-gray-500">
          Page {pageIndex + 1}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DiscordModalBuilder — main export
// ---------------------------------------------------------------------------

export function DiscordModalBuilder({ onSave, isSaving }: DiscordModalBuilderProps) {
  const [pages, setPages] = useState<ModalPage[]>([makePage(1)]);
  const [settings, setSettings] = useState<ModalSettings>({
    outputLimitEnabled: false,
    outputLimit: 1,
    outputLocations: [makeLocation()],
  });
  const [roleRestrictDialogOpen, setRoleRestrictDialogOpen] = useState(false);
  const [roleOutputDialogOpen, setRoleOutputDialogOpen] = useState(false);

  // ---- Page mutations ----

  function addPage() {
    if (pages.length >= 5) return;
    setPages((prev) => [...prev, makePage(prev.length + 1)]);
  }

  function updatePage(idx: number, page: ModalPage) {
    setPages((prev) => prev.map((p, i) => (i === idx ? page : p)));
  }

  function duplicatePage(idx: number) {
    const copy: ModalPage = {
      ...pages[idx],
      id: uid(),
      inputs: pages[idx].inputs.map((inp) => ({ ...inp, id: uid() })),
    };
    setPages((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }

  function deletePage(idx: number) {
    if (pages.length === 1) return;
    setPages((prev) => prev.filter((_, i) => i !== idx));
  }

  // ---- Input mutations ----

  function addInput(pageIdx: number) {
    if (pages[pageIdx].inputs.length >= 5) return;
    updatePage(pageIdx, {
      ...pages[pageIdx],
      inputs: [...pages[pageIdx].inputs, makeInput()],
    });
  }

  function updateInput(pageIdx: number, inputIdx: number, input: ModalTextInput) {
    const page = pages[pageIdx];
    updatePage(pageIdx, {
      ...page,
      inputs: page.inputs.map((inp, i) => (i === inputIdx ? input : inp)),
    });
  }

  function duplicateInput(pageIdx: number, inputIdx: number) {
    const page = pages[pageIdx];
    if (page.inputs.length >= 5) return;
    const copy: ModalTextInput = { ...page.inputs[inputIdx], id: uid() };
    const next = [...page.inputs];
    next.splice(inputIdx + 1, 0, copy);
    updatePage(pageIdx, { ...page, inputs: next });
  }

  function deleteInput(pageIdx: number, inputIdx: number) {
    const page = pages[pageIdx];
    updatePage(pageIdx, {
      ...page,
      inputs: page.inputs.filter((_, i) => i !== inputIdx),
    });
  }

  function moveInput(pageIdx: number, inputIdx: number, dir: -1 | 1) {
    const page = pages[pageIdx];
    const next = [...page.inputs];
    const ni = inputIdx + dir;
    if (ni < 0 || ni >= next.length) return;
    [next[inputIdx], next[ni]] = [next[ni], next[inputIdx]];
    updatePage(pageIdx, { ...page, inputs: next });
  }

  // ---- Location mutations ----

  function addLocation() {
    if (settings.outputLocations.length >= 2) return;
    setSettings((prev) => ({
      ...prev,
      outputLocations: [...prev.outputLocations, makeLocation()],
    }));
  }

  function updateLocation(idx: number, loc: OutputLocation) {
    setSettings((prev) => ({
      ...prev,
      outputLocations: prev.outputLocations.map((l, i) => (i === idx ? loc : l)),
    }));
  }

  function deleteLocation(idx: number) {
    setSettings((prev) => ({
      ...prev,
      outputLocations: prev.outputLocations.filter((_, i) => i !== idx),
    }));
  }

  return (
    <div className="space-y-8">
      {pages.map((page, pageIdx) => (
        <ModalPageEditor
          key={page.id}
          page={page}
          pageIndex={pageIdx}
          totalPages={pages.length}
          onChange={(updated) => updatePage(pageIdx, updated)}
          onDuplicate={() => duplicatePage(pageIdx)}
          onDelete={() => deletePage(pageIdx)}
          onAddInput={() => addInput(pageIdx)}
          onUpdateInput={(inputIdx, input) => updateInput(pageIdx, inputIdx, input)}
          onDuplicateInput={(inputIdx) => duplicateInput(pageIdx, inputIdx)}
          onDeleteInput={(inputIdx) => deleteInput(pageIdx, inputIdx)}
          onMoveInput={(inputIdx, dir) => moveInput(pageIdx, inputIdx, dir)}
        />
      ))}

      {pages.length < 5 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={addPage}
            className="rounded-lg border-2 border-dashed border-[#3f4147] px-8 py-3 text-sm text-gray-400 transition-colors duration-150 hover:border-[#5865F2] hover:text-[#5865F2]"
          >
            + Add Page
          </button>
        </div>
      )}

      <ModalSettingsPanel
        settings={settings}
        onChange={setSettings}
        onAddLocation={addLocation}
        onUpdateLocation={updateLocation}
        onDeleteLocation={deleteLocation}
        onRoleRestrictOpen={() => setRoleRestrictDialogOpen(true)}
        onRoleOutputOpen={() => setRoleOutputDialogOpen(true)}
      />

      {/* Suppress unused prop warning for onSave/isSaving until wired */}
      {onSave && isSaving !== undefined && null}

      {/* Role Restrictions Dialog */}
      <Dialog open={roleRestrictDialogOpen} onOpenChange={setRoleRestrictDialogOpen}>
        <DialogContent className="border-[#3f4147] bg-[#313338] text-white">
          <DialogHeader>
            <DialogTitle>Role Restrictions</DialogTitle>
            <DialogDescription className="text-gray-400">
              Only members with these roles can trigger this modal.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-400">
              Role restriction configuration coming soon.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Output Dialog */}
      <Dialog open={roleOutputDialogOpen} onOpenChange={setRoleOutputDialogOpen}>
        <DialogContent className="border-[#3f4147] bg-[#313338] text-white">
          <DialogHeader>
            <DialogTitle>Update User Roles on Output</DialogTitle>
            <DialogDescription className="text-gray-400">
              Grant or remove roles from the user upon modal submission.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-400">
              Role assignment configuration coming soon.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
