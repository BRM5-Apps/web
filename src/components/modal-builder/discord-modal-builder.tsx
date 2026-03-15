"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GripVertical,
  Trash2,
  Copy,
  X,
  FileText,
  Search,
  Users,
  Shield,
  Hash,
  RefreshCw,
  Upload,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Smile,
  Mail,
  User,
  Ticket,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ComponentType =
  | "short-answer"
  | "paragraph"
  | "multiple-choice"
  | "checkboxes"
  | "dropdown"
  | "text-display"
  | "file-upload"
  | "single-checkbox"
  | "user-select"
  | "role-select"
  | "channel-select"
  | "user-role-select";

export interface DropdownOption {
  id: string;
  label: string;
  description: string;
  emoji: string;
}

export interface ModalComponent {
  id: string;
  type: ComponentType;
  label: string;
  required: boolean;
  placeholder: string;
  description: string;
  minLength?: number;
  maxLength?: number;
  content: string;
  options: DropdownOption[];
}

export interface ModalPage {
  id: string;
  title: string;
  components: ModalComponent[];
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
// SVG Icons
// ---------------------------------------------------------------------------

function ShortAnswerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="12" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="2" y="9" width="8" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  );
}

function ParagraphIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="12" height="1.2" rx="0.6" fill="currentColor" />
      <rect x="2" y="5.5" width="10" height="1.2" rx="0.6" fill="currentColor" />
      <rect x="2" y="8" width="12" height="1.2" rx="0.6" fill="currentColor" />
      <rect x="2" y="10.5" width="8" height="1.2" rx="0.6" fill="currentColor" />
      <rect x="2" y="13" width="11" height="1.2" rx="0.6" fill="currentColor" />
    </svg>
  );
}

function MultipleChoiceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2.5" fill="currentColor" />
    </svg>
  );
}

function CheckboxesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DropdownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 7L8 9.5L10.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TextDisplayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 4H7V12H5.5V5.5H3V4Z" fill="currentColor" />
      <rect x="9" y="7" width="5" height="1.2" rx="0.6" fill="currentColor" />
      <rect x="9" y="9.5" width="4" height="1.2" rx="0.6" fill="currentColor" />
      <rect x="9" y="4.5" width="5" height="1.2" rx="0.6" fill="currentColor" />
    </svg>
  );
}

function FileUploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 2H4.5C3.67 2 3 2.67 3 3.5V12.5C3 13.33 3.67 14 4.5 14H11.5C12.33 14 13 13.33 13 12.5V6L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8 11V7M8 7L6 9M8 7L10 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SingleCheckboxIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component Group Catalog
// ---------------------------------------------------------------------------

interface ComponentGroupItem {
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
}

interface ComponentGroup {
  label: string;
  items: ComponentGroupItem[];
}

const COMPONENT_GROUPS: ComponentGroup[] = [
  {
    label: "Text Input",
    items: [
      { type: "short-answer", label: "Short Answer", icon: <ShortAnswerIcon /> },
      { type: "paragraph", label: "Paragraph", icon: <ParagraphIcon /> },
    ],
  },
  {
    label: "Choice",
    items: [
      { type: "multiple-choice", label: "Multiple Choice", icon: <MultipleChoiceIcon /> },
      { type: "checkboxes", label: "Checkboxes", icon: <CheckboxesIcon /> },
      { type: "dropdown", label: "Dropdown", icon: <DropdownIcon /> },
    ],
  },
  {
    label: "Display",
    items: [{ type: "text-display", label: "Text Display", icon: <TextDisplayIcon /> }],
  },
  {
    label: "Upload",
    items: [{ type: "file-upload", label: "File Upload", icon: <FileUploadIcon /> }],
  },
  {
    label: "Toggle",
    items: [{ type: "single-checkbox", label: "Single Checkbox", icon: <SingleCheckboxIcon /> }],
  },
  {
    label: "Select",
    items: [
      { type: "user-select", label: "User Select", icon: <Users size={16} /> },
      { type: "role-select", label: "Role Select", icon: <Shield size={16} /> },
      { type: "channel-select", label: "Channel Select", icon: <Hash size={16} /> },
      { type: "user-role-select", label: "User & Role Select", icon: <RefreshCw size={16} /> },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uid(): string {
  return crypto.randomUUID();
}

const DEFAULT_LABELS: Record<ComponentType, string> = {
  "short-answer": "Short Answer",
  paragraph: "Paragraph",
  "multiple-choice": "Multiple Choice",
  checkboxes: "Checkboxes",
  dropdown: "Dropdown",
  "text-display": "This is a text display.",
  "file-upload": "File Upload",
  "single-checkbox": "I agree to the terms",
  "user-select": "Select a user",
  "role-select": "Select a role",
  "channel-select": "Select a channel",
  "user-role-select": "Select a user or role",
};

function makeComponent(type: ComponentType): ModalComponent {
  return {
    id: uid(),
    type,
    label: DEFAULT_LABELS[type],
    required: type !== "text-display" && type !== "single-checkbox",
    placeholder: "",
    description: "",
    content: type === "text-display" ? "Enter your text here..." : "",
    options: ["dropdown", "multiple-choice", "checkboxes"].includes(type)
      ? [makeOption()]
      : [],
  };
}

function makeOption(): DropdownOption {
  return { id: uid(), label: "Option", description: "", emoji: "" };
}

function makePage(): ModalPage {
  return { id: uid(), title: "Modal Title", components: [] };
}

function makeLocation(): OutputLocation {
  return { id: uid(), type: "default", channelId: "", mentions: [], anonymise: false };
}

// ---------------------------------------------------------------------------
// DiscordToggle — replaces shadcn Switch with a fully Discord-styled toggle
// ---------------------------------------------------------------------------

interface DiscordToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

function DiscordToggle({ checked, onCheckedChange, disabled = false }: DiscordToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "relative h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none",
        checked ? "bg-[#5865F1]" : "bg-[#3f4147]",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// ActionButton
// ---------------------------------------------------------------------------

interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}

function ActionButton({ children, onClick, active = false }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded border px-2 py-0.5 text-[11px] transition-colors duration-150",
        active
          ? "border-[#5865F1]/40 bg-[#5865F1]/10 text-[#5865F1]"
          : "border-[#3f4147] text-[#C7C6CB] hover:border-[#5865F1]/40 hover:text-[#5865F1]"
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// AddComponentDialog
// ---------------------------------------------------------------------------

interface AddComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: ComponentType) => void;
}

function AddComponentDialog({ open, onOpenChange, onSelect }: AddComponentDialogProps) {
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setHighlighted(null);
    }
  }, [open]);

  const query = search.toLowerCase().trim();

  const filteredGroups = COMPONENT_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.label.toLowerCase().includes(query)),
  })).filter((group) => group.items.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] border-[#1e1f22] bg-[#2F2F34] p-0 text-[#F1F1F2]">
        <DialogHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-0">
          <DialogTitle className="text-base font-semibold text-[#F1F1F2]">Add Component</DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-[#C7C6CB] hover:text-[#F1F1F2] transition-colors duration-150"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="px-4 pt-2 pb-0">
          <div className="flex items-center gap-2 rounded-[4px] bg-[#1e1f22] px-3 py-2">
            <Search className="h-4 w-4 text-[#8F8E8E]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components..."
              className="flex-1 bg-transparent text-sm text-[#F1F1F2] outline-none placeholder:text-[#8F8E8E]"
            />
          </div>
        </div>

        <div className="max-h-[320px] overflow-y-auto px-0 pb-4">
          {filteredGroups.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <div className="mx-4 my-1.5 h-px bg-[#3f4147]" />}
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#8F8E8E]">
                {group.label}
              </p>
              {group.items.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onMouseEnter={() => setHighlighted(item.type)}
                  onMouseLeave={() => setHighlighted(null)}
                  onClick={() => {
                    onSelect(item.type);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150",
                    highlighted === item.type
                      ? "bg-[#5865F1] text-[#F1F1F2]"
                      : "text-[#F1F1F2] hover:bg-[#5865F1] hover:text-[#F1F1F2]"
                  )}
                >
                  <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
          {filteredGroups.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-[#8F8E8E]">No components found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// EditBoundsDialog
// ---------------------------------------------------------------------------

interface EditBoundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  minLength?: number;
  maxLength?: number;
  onSave: (min: number | undefined, max: number | undefined) => void;
}

function EditBoundsDialog({ open, onOpenChange, minLength, maxLength, onSave }: EditBoundsDialogProps) {
  const [min, setMin] = useState<string>("");
  const [max, setMax] = useState<string>("");

  useEffect(() => {
    if (open) {
      setMin(minLength !== undefined ? String(minLength) : "");
      setMax(maxLength !== undefined ? String(maxLength) : "");
    }
  }, [open, minLength, maxLength]);

  function handleSave() {
    onSave(
      min.trim() ? Number(min) : undefined,
      max.trim() ? Number(max) : undefined
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] border-[#1e1f22] bg-[#2F2F34] p-0 text-[#F1F1F2]">
        <DialogHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-0">
          <DialogTitle className="text-base font-semibold text-[#F1F1F2]">Edit Bounds</DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-[#C7C6CB] hover:text-[#F1F1F2] transition-colors duration-150"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>
        <div className="space-y-4 px-4 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#F1F1F2]">Minimum Length</label>
            <p className="mb-1.5 text-xs italic text-[#8F8E8E]">Must be between 0 and 4000</p>
            <input
              type="number"
              min={0}
              max={4000}
              value={min}
              onChange={(e) => setMin(e.target.value)}
              placeholder="0"
              className="w-full rounded-[4px] border border-[#1e1f22] bg-[#1e1f22] px-3 py-2 text-sm text-[#F1F1F2] outline-none placeholder:text-[#8F8E8E]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#F1F1F2]">Maximum Length</label>
            <p className="mb-1.5 text-xs italic text-[#8F8E8E]">Must be between 1 and 4000</p>
            <input
              type="number"
              min={1}
              max={4000}
              value={max}
              onChange={(e) => setMax(e.target.value)}
              placeholder="1"
              className="w-full rounded-[4px] border border-[#1e1f22] bg-[#1e1f22] px-3 py-2 text-sm text-[#F1F1F2] outline-none placeholder:text-[#8F8E8E]"
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-[4px] bg-[#5865F1] py-2.5 text-sm font-medium text-[#F1F1F2] hover:bg-[#4752c4] transition-colors duration-150"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// EditPlaceholderDialog
// ---------------------------------------------------------------------------

interface EditPlaceholderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder: string;
  onSave: (placeholder: string) => void;
}

function EditPlaceholderDialog({ open, onOpenChange, placeholder, onSave }: EditPlaceholderDialogProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) {
      setValue(placeholder);
    }
  }, [open, placeholder]);

  function handleSave() {
    onSave(value);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] border-[#1e1f22] bg-[#2F2F34] p-0 text-[#F1F1F2]">
        <DialogHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-0">
          <DialogTitle className="text-base font-semibold text-[#F1F1F2]">Edit Placeholder</DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-[#C7C6CB] hover:text-[#F1F1F2] transition-colors duration-150"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>
        <div className="space-y-4 px-4 py-4">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={100}
            placeholder="Enter placeholder text..."
            className="w-full rounded-[4px] border border-[#1e1f22] bg-[#1e1f22] px-3 py-2 text-sm text-[#F1F1F2] outline-none placeholder:text-[#8F8E8E]"
          />
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-[4px] bg-[#5865F1] py-2.5 text-sm font-medium text-[#F1F1F2] hover:bg-[#4752c4] transition-colors duration-150"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// OptionCard (sortable)
// ---------------------------------------------------------------------------

interface OptionCardProps {
  option: DropdownOption;
  onChange: (option: DropdownOption) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

function OptionCard({ option, onChange, onDuplicate, onDelete, canDelete }: OptionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: option.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("rounded-[4px] border border-[#3f4147] bg-[#1e1f22]", isDragging && "opacity-50")}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-[#8F8E8E]" />
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-[#C7C6CB] transition-transform duration-150"
        >
          <ChevronRight
            className={cn("h-4 w-4 transition-transform duration-150", expanded && "rotate-90")}
          />
        </button>
        <span className="flex-1 truncate text-sm text-[#F1F1F2]">
          {option.label || <span className="italic text-[#8F8E8E]">Untitled</span>}
        </span>
        {!option.label && (
          <AlertTriangle className="h-3.5 w-3.5 text-[#f0a500]" />
        )}
        <button
          type="button"
          onClick={onDuplicate}
          className="text-[#8F8E8E] hover:text-[#F1F1F2] transition-colors duration-150"
          aria-label="Duplicate option"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-[#8F8E8E] hover:text-[#f23f42] transition-colors duration-150"
            aria-label="Delete option"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-[#3f4147] px-3 py-3">
          <div className="flex items-start gap-2">
            <button
              type="button"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[4px] border border-[#3f4147] bg-[#2F2F34] text-[#8F8E8E] hover:text-[#F1F1F2] transition-colors duration-150"
              aria-label="Select emoji"
            >
              {option.emoji ? (
                <span className="text-base">{option.emoji}</span>
              ) : (
                <Smile className="h-4 w-4" />
              )}
            </button>
            <div className="flex-1 space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-[#C7C6CB]">
                    Label <span className="text-[#f23f42]">*</span>
                  </label>
                  <span className="text-[10px] italic text-[#8F8E8E]">
                    {option.label.length}/100
                  </span>
                </div>
                <input
                  value={option.label}
                  onChange={(e) =>
                    onChange({ ...option, label: e.target.value.slice(0, 100) })
                  }
                  maxLength={100}
                  className="w-full rounded-[4px] border border-[#3f4147] bg-[#2F2F34] px-2 py-1.5 text-sm text-[#F1F1F2] outline-none placeholder:text-[#8F8E8E]"
                  placeholder="Option label"
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-[#C7C6CB]">Description</label>
                  <span className="text-[10px] italic text-[#8F8E8E]">
                    {option.description.length}/100
                  </span>
                </div>
                <input
                  value={option.description}
                  onChange={(e) =>
                    onChange({ ...option, description: e.target.value.slice(0, 100) })
                  }
                  maxLength={100}
                  className="w-full rounded-[4px] border border-[#3f4147] bg-[#2F2F34] px-2 py-1.5 text-sm text-[#F1F1F2] outline-none placeholder:text-[#8F8E8E]"
                  placeholder="Optional description"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EditOptionsDialog
// ---------------------------------------------------------------------------

const MAX_OPTIONS = 25;

interface EditOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: DropdownOption[];
  onSave: (options: DropdownOption[]) => void;
}

function EditOptionsDialog({ open, onOpenChange, options: initialOptions, onSave }: EditOptionsDialogProps) {
  const [options, setOptions] = useState<DropdownOption[]>([]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (open) {
      setOptions(initialOptions.map((o) => ({ ...o })));
    }
  }, [open, initialOptions]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOptions((prev) => {
        const oldIndex = prev.findIndex((o) => o.id === active.id);
        const newIndex = prev.findIndex((o) => o.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  function updateOption(idx: number, updated: DropdownOption) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? updated : o)));
  }

  function duplicateOption(idx: number) {
    if (options.length >= MAX_OPTIONS) return;
    const copy = { ...options[idx], id: uid() };
    setOptions((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }

  function deleteOption(idx: number) {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSave() {
    onSave(options);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] border-[#1e1f22] bg-[#2F2F34] p-0 text-[#F1F1F2]">
        <DialogHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-0">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-semibold text-[#F1F1F2]">Edit Options</DialogTitle>
            <span className="text-xs text-[#8F8E8E]">
              {options.length}/{MAX_OPTIONS}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-[#C7C6CB] hover:text-[#F1F1F2] transition-colors duration-150"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto px-4 py-3">
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={options.map((o) => o.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {options.map((option, idx) => (
                  <OptionCard
                    key={option.id}
                    option={option}
                    onChange={(updated) => updateOption(idx, updated)}
                    onDuplicate={() => duplicateOption(idx)}
                    onDelete={() => deleteOption(idx)}
                    canDelete={options.length > 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {options.length < MAX_OPTIONS && (
            <button
              type="button"
              onClick={() => setOptions((prev) => [...prev, makeOption()])}
              className="mt-3 pl-6 text-sm font-medium text-[#5865F1] hover:text-[#4752c4] transition-colors duration-150"
            >
              + Add Option
            </button>
          )}
        </div>

        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-[4px] bg-[#5865F1] py-2.5 text-sm font-medium text-[#F1F1F2] hover:bg-[#4752c4] transition-colors duration-150"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// ComponentPreview
// ---------------------------------------------------------------------------

interface ComponentPreviewProps {
  component: ModalComponent;
  onChange: (component: ModalComponent) => void;
  onOptionsOpen: () => void;
}

function ComponentPreview({ component, onChange, onOptionsOpen }: ComponentPreviewProps) {
  const hasOptions = ["dropdown", "multiple-choice", "checkboxes"].includes(component.type);
  const isSelectType = ["user-select", "role-select", "channel-select", "user-role-select"].includes(
    component.type
  );

  // Text Display
  if (component.type === "text-display") {
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange({ ...component, content: e.currentTarget.textContent || "" })}
        className="min-h-[20px] rounded px-1 text-[14px] text-[#F1F1F2] outline-none hover:border hover:border-dashed hover:border-[#5865F1]"
      >
        {component.content}
      </div>
    );
  }

  // Single Checkbox
  if (component.type === "single-checkbox") {
    return (
      <div className="space-y-1">
        {component.description ? (
          <input
            value={component.description}
            onChange={(e) => onChange({ ...component, description: e.target.value })}
            placeholder="Enter description..."
            className="block w-full bg-transparent text-[12px] text-[#C7C6CB] outline-none placeholder:text-[#8F8E8E]/60"
          />
        ) : null}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 flex-shrink-0 rounded-[3px] border border-[#87898c]" />
          <input
            value={component.label}
            onChange={(e) => onChange({ ...component, label: e.target.value })}
            placeholder="Checkbox label"
            className="cursor-text bg-transparent text-sm text-[#F1F1F2] outline-none placeholder:text-[#8F8E8E]"
          />
        </div>
      </div>
    );
  }

  // Label element shared by most types
  const labelEl = (
    <div className="mb-0.5 flex items-center">
      <input
        value={component.label}
        onChange={(e) => onChange({ ...component, label: e.target.value })}
        className="bg-transparent text-[17px] font-bold text-[#F1F1F2] outline-none"
        size={Math.max(component.label.length, 1)}
      />
      {component.required && <span className="text-[17px] leading-none text-[#f23f42]">*</span>}
    </div>
  );

  const descriptionEl = component.description ? (
    <input
      value={component.description}
      onChange={(e) => onChange({ ...component, description: e.target.value })}
      placeholder="Enter description..."
      className="mb-1 block w-full bg-transparent text-[12px] text-[#C7C6CB] outline-none placeholder:text-[#8F8E8E]/60"
    />
  ) : null;

  // Short Answer
  if (component.type === "short-answer") {
    return (
      <div>
        {labelEl}
        {descriptionEl}
        <input
          readOnly
          placeholder={component.placeholder || "Enter text..."}
          className="w-full rounded-[3px] border border-[#1e1f22] bg-[#1e1f22] px-2 py-2 text-[14px] text-[#F1F1F2] outline-none placeholder:text-[#8F8E8E]"
        />
      </div>
    );
  }

  // Paragraph
  if (component.type === "paragraph") {
    return (
      <div>
        {labelEl}
        {descriptionEl}
        <div className="flex h-[120px] flex-col items-center justify-center rounded-[3px] border border-dashed border-[#3f4147] bg-[#1e1f22]">
          <Upload className="mb-1 h-6 w-6 text-[#8F8E8E]" />
          <p className="text-[13px] text-[#C7C6CB]">Drop file here or browse</p>
          <p className="text-[11px] text-[#8F8E8E]">Upload a file under 10MB</p>
        </div>
      </div>
    );
  }

  // Multiple Choice
  if (component.type === "multiple-choice") {
    return (
      <div>
        {labelEl}
        {descriptionEl}
        <div className="space-y-1.5">
          {component.options.map((opt, idx) => (
            <div key={opt.id} className="group/opt flex items-center gap-2">
              <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-[#87898c]" />
              <input
                value={opt.label}
                onChange={(e) =>
                  onChange({
                    ...component,
                    options: component.options.map((o, i) =>
                      i === idx ? { ...o, label: e.target.value } : o
                    ),
                  })
                }
                className="flex-1 bg-transparent text-sm text-[#F1F1F2] outline-none"
              />
              {component.options.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({ ...component, options: component.options.filter((_, i) => i !== idx) })
                  }
                  className="opacity-0 transition-opacity group-hover/opt:opacity-100 text-[#8F8E8E] hover:text-[#f23f42]"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          {component.options.length < 25 && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...component,
                  options: [...component.options, { id: uid(), label: `Option ${component.options.length + 1}`, description: "", emoji: "" }],
                })
              }
              className="text-[11px] text-[#5865F1] transition-colors hover:text-[#4752c4]"
            >
              + Add option
            </button>
          )}
        </div>
      </div>
    );
  }

  // Checkboxes
  if (component.type === "checkboxes") {
    return (
      <div>
        {labelEl}
        {descriptionEl}
        <div className="space-y-1.5">
          {component.options.map((opt, idx) => (
            <div key={opt.id} className="group/opt flex items-center gap-2">
              <div className="h-4 w-4 flex-shrink-0 rounded-[3px] border border-[#87898c]" />
              <input
                value={opt.label}
                onChange={(e) =>
                  onChange({
                    ...component,
                    options: component.options.map((o, i) =>
                      i === idx ? { ...o, label: e.target.value } : o
                    ),
                  })
                }
                className="flex-1 bg-transparent text-sm text-[#F1F1F2] outline-none"
              />
              {component.options.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({ ...component, options: component.options.filter((_, i) => i !== idx) })
                  }
                  className="opacity-0 transition-opacity group-hover/opt:opacity-100 text-[#8F8E8E] hover:text-[#f23f42]"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          {component.options.length < 25 && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...component,
                  options: [...component.options, { id: uid(), label: `Option ${component.options.length + 1}`, description: "", emoji: "" }],
                })
              }
              className="text-[11px] text-[#5865F1] transition-colors hover:text-[#4752c4]"
            >
              + Add option
            </button>
          )}
        </div>
      </div>
    );
  }

  // Dropdown and Select types
  if (component.type === "dropdown" || isSelectType) {
    const placeholderMap: Record<string, string> = {
      dropdown: "Make a selection",
      "user-select": "Select a user",
      "role-select": "Select a role",
      "channel-select": "Select a channel",
      "user-role-select": "Select a user or role",
    };
    return (
      <div>
        {labelEl}
        {descriptionEl}
        <button
          type="button"
          onClick={component.type === "dropdown" ? onOptionsOpen : undefined}
          className="flex w-full items-center justify-between rounded-[3px] border border-[#1e1f22] bg-[#1e1f22] px-3 py-2 text-sm text-[#8F8E8E]"
        >
          <span>{component.placeholder || placeholderMap[component.type] || "Make a selection"}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // File Upload
  if (component.type === "file-upload") {
    return (
      <div>
        {labelEl}
        {descriptionEl}
        <div className="flex h-[80px] items-center justify-center gap-2 rounded-[3px] border-2 border-dashed border-[#3f4147] bg-[#1e1f22]">
          <Upload className="h-5 w-5 text-[#8F8E8E]" />
          <span className="text-sm text-[#8F8E8E]">Upload a file</span>
        </div>
      </div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// ModalComponentRow (sortable)
// ---------------------------------------------------------------------------

interface ModalComponentRowProps {
  component: ModalComponent;
  onChange: (component: ModalComponent) => void;
  onDelete: () => void;
}

function ModalComponentRow({ component, onChange, onDelete }: ModalComponentRowProps) {
  const [boundsOpen, setBoundsOpen] = useState(false);
  const [placeholderOpen, setPlaceholderOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const hasOptions = ["dropdown", "multiple-choice", "checkboxes"].includes(component.type);
  const isSelectType = ["user-select", "role-select", "channel-select", "user-role-select"].includes(
    component.type
  );
  const hasBounds = [
    "short-answer",
    "paragraph",
    "dropdown",
    "user-select",
    "role-select",
    "channel-select",
    "user-role-select",
  ].includes(component.type);
  const hasPlaceholder = hasBounds;

  function renderActionButtons() {
    if (component.type === "text-display") return null;

    const buttons: React.ReactNode[] = [];

    // + Description
    if (!component.description) {
      buttons.push(
        <button
          key="desc"
          type="button"
          onClick={() => onChange({ ...component, description: "Enter description" })}
          className="rounded border border-[#5865F1]/40 px-2 py-0.5 text-[11px] text-[#5865F1] hover:bg-[#5865F1]/10 transition-colors duration-150"
        >
          + Description
        </button>
      );
    }

    if (component.type === "single-checkbox") {
      return buttons.length > 0 ? <>{buttons}</> : null;
    }

    // Required
    {
      buttons.push(
        <ActionButton
          key="req"
          onClick={() => onChange({ ...component, required: !component.required })}
          active={component.required}
        >
          Required
        </ActionButton>
      );
    }

    // Bounds
    if (hasBounds) {
      buttons.push(
        <ActionButton key="bounds" onClick={() => setBoundsOpen(true)}>
          Bounds
        </ActionButton>
      );
    }

    // Placeholder
    if (hasPlaceholder) {
      buttons.push(
        <ActionButton key="placeholder" onClick={() => setPlaceholderOpen(true)}>
          Placeholder
        </ActionButton>
      );
    }

    // Edit Options (only for dropdown, multiple-choice, checkboxes — not select menus)
    if (hasOptions) {
      buttons.push(
        <ActionButton key="options" onClick={() => setOptionsOpen(true)}>
          Edit Options
        </ActionButton>
      );
    }

    return <>{buttons}</>;
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn("group/comp flex items-start gap-2", isDragging && "opacity-50")}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-5 cursor-grab opacity-0 transition-opacity duration-150 group-hover/comp:opacity-100"
        >
          <GripVertical className="h-4 w-4 text-[#8F8E8E]" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <ComponentPreview
            component={component}
            onChange={onChange}
            onOptionsOpen={() => setOptionsOpen(true)}
          />
          {/* Action buttons row */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 opacity-0 transition-opacity duration-150 group-hover/comp:opacity-100">
            {renderActionButtons()}
          </div>
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={onDelete}
          className="mt-5 opacity-0 transition-opacity duration-150 group-hover/comp:opacity-100 text-[#8F8E8E] hover:text-[#f23f42]"
          aria-label="Delete component"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Sub-dialogs */}
      <EditBoundsDialog
        open={boundsOpen}
        onOpenChange={setBoundsOpen}
        minLength={component.minLength}
        maxLength={component.maxLength}
        onSave={(min, max) => onChange({ ...component, minLength: min, maxLength: max })}
      />
      <EditPlaceholderDialog
        open={placeholderOpen}
        onOpenChange={setPlaceholderOpen}
        placeholder={component.placeholder}
        onSave={(ph) => onChange({ ...component, placeholder: ph })}
      />
      {hasOptions && (
        <EditOptionsDialog
          open={optionsOpen}
          onOpenChange={setOptionsOpen}
          options={component.options}
          onSave={(opts) => onChange({ ...component, options: opts })}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// ModalPageCard
// ---------------------------------------------------------------------------

interface ModalPageCardProps {
  page: ModalPage;
  pageIndex: number;
  totalPages: number;
  onChange: (page: ModalPage) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function ModalPageCard({ page, pageIndex, totalPages, onChange, onDuplicate, onDelete }: ModalPageCardProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const isFull = page.components.length >= 5;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = page.components.findIndex((c) => c.id === active.id);
      const newIndex = page.components.findIndex((c) => c.id === over.id);
      onChange({ ...page, components: arrayMove(page.components, oldIndex, newIndex) });
    }
  }

  function addComponent(type: ComponentType) {
    if (isFull) return;
    onChange({ ...page, components: [...page.components, makeComponent(type)] });
  }

  function updateComponent(idx: number, updated: ModalComponent) {
    onChange({
      ...page,
      components: page.components.map((c, i) => (i === idx ? updated : c)),
    });
  }

  function deleteComponent(idx: number) {
    onChange({
      ...page,
      components: page.components.filter((_, i) => i !== idx),
    });
  }

  return (
    <div className="group/page">
      {/* Page header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#F1F1F2]">Page {pageIndex + 1}</span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs",
              isFull ? "text-[#f23f42]" : "text-[#C7C6CB]"
            )}
          >
            {page.components.length}/5 components
          </span>
          <div className="flex gap-1 opacity-0 transition-opacity duration-150 group-hover/page:opacity-100">
            <button
              type="button"
              onClick={onDuplicate}
              title="Duplicate page"
              className="rounded p-1 text-[#8F8E8E] hover:bg-white/10 hover:text-[#F1F1F2] transition-colors duration-150"
              aria-label="Duplicate page"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={totalPages === 1}
              title="Delete page"
              className="rounded p-1 text-[#8F8E8E] hover:bg-white/10 hover:text-[#f23f42] disabled:opacity-30 transition-colors duration-150"
              aria-label="Delete page"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Discord modal card */}
      <div className="mx-auto max-w-[480px] rounded-[4px] bg-[#232327] shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#5865F1]">
            <FileText className="h-4 w-4 text-[#F1F1F2]" />
          </div>
          <input
            value={page.title}
            onChange={(e) => onChange({ ...page, title: e.target.value })}
            maxLength={45}
            className="flex-1 bg-transparent text-[24px] font-bold text-[#F1F1F2] outline-none"
            placeholder="Modal Title"
          />
          <button
            type="button"
            disabled
            className="flex-shrink-0 cursor-not-allowed text-[#C7C6CB] opacity-40"
            aria-label="Close modal (disabled)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Component list */}
        {page.components.length > 0 && (
          <div className="max-h-[440px] overflow-y-auto border-t border-b border-[#3f4147] px-4 py-3">
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext
                items={page.components.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {page.components.map((comp, idx) => (
                    <ModalComponentRow
                      key={comp.id}
                      component={comp}
                      onChange={(updated) => updateComponent(idx, updated)}
                      onDelete={() => deleteComponent(idx)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 pb-4 pt-2">
          {!isFull && (
            <button
              type="button"
              onClick={() => setAddDialogOpen(true)}
              className="mb-3 w-full rounded-[4px] border-2 border-dashed border-[#3f4147] py-2 text-sm text-[#C7C6CB] transition-colors duration-150 hover:border-[#5865F1] hover:text-[#5865F1]"
            >
              + Add a component
            </button>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-[3px] bg-[#2F2F34] py-2.5 text-sm font-medium text-[#646365] transition-colors duration-150 hover:bg-[#3a3a3f]"
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex-1 rounded-[3px] bg-[#5865F1] py-2.5 text-sm font-medium text-[#F1F1F2] transition-colors duration-150 hover:bg-[#4752c4]"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* AddComponentDialog */}
      <AddComponentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSelect={addComponent}
      />
    </div>
  );
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
    <div className="flex min-h-[36px] flex-wrap gap-1 rounded border border-[#3f4147] bg-[#2F2F34] px-2 py-1.5">
      {value.map((m, i) => (
        <span
          key={i}
          className="flex items-center gap-1 rounded border border-[#5865F1]/40 bg-[#5865F1]/20 px-1.5 py-0.5 text-xs text-[#5865F1]"
        >
          {m}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="hover:text-[#F1F1F2]"
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
          className="min-w-[120px] flex-1 bg-transparent text-xs text-[#F1F1F2] placeholder:text-[#8F8E8E] outline-none"
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
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5865F1]">
            <span className="text-[11px] font-bold text-[#F1F1F2]">D</span>
          </div>
          <span className="text-sm font-medium text-[#F1F1F2]">Discord</span>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-[#8F8E8E] hover:text-[#f23f42] transition-colors duration-150"
          aria-label="Delete output location"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Type selector */}
      <div className="mb-3">
        <p className="mb-1.5 text-xs text-[#C7C6CB]">Type</p>
        <div className="flex gap-1 rounded bg-[#2F2F34] p-1">
          {(["default", "application", "ticket"] as OutputLocationType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...location, type: t })}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors duration-150",
                location.type === t
                  ? "bg-[#5865F1] text-[#F1F1F2]"
                  : "text-[#C7C6CB] hover:bg-[#3f4147] hover:text-[#F1F1F2]"
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
        <p className="mb-1 text-xs text-[#C7C6CB]">
          Channel <span className="text-[#f23f42]">*</span>
        </p>
        <div className="flex items-center gap-1.5 rounded border border-[#3f4147] bg-[#2F2F34] px-2 py-1.5">
          <span className="text-sm text-[#C7C6CB]">#</span>
          <input
            value={location.channelId}
            onChange={(e) => onChange({ ...location, channelId: e.target.value })}
            placeholder="channel-name or ID"
            className="flex-1 bg-transparent text-sm text-[#F1F1F2] placeholder:text-[#8F8E8E] outline-none"
          />
        </div>
      </div>

      {/* Mentions */}
      <div className="mb-3">
        <p className="mb-1 text-xs text-[#C7C6CB]">
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
        <span className="text-sm text-[#F1F1F2]">Anonymise User</span>
        <DiscordToggle
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
    <div className="space-y-4 rounded-lg border border-[#3f4147] bg-[#2F2F34] p-6">
      <h2 className="text-base font-semibold text-[#F1F1F2]">Settings</h2>

      {/* Role Restrictions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#F1F1F2]">Role Restrictions</p>
          <p className="text-xs text-[#C7C6CB]">Restrict which roles can trigger this modal</p>
        </div>
        <button
          type="button"
          onClick={onRoleRestrictOpen}
          className="rounded-[3px] bg-[#5865F1] px-3 py-1.5 text-xs font-medium text-[#F1F1F2] transition-colors hover:bg-[#4752c4]"
        >
          Configure
        </button>
      </div>

      <div className="h-px bg-[#3f4147]" />

      {/* Update User Roles on Output */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#F1F1F2]">Update User Roles on Output</p>
          <p className="text-xs text-[#C7C6CB]">
            Grant or remove roles when a user submits this modal
          </p>
        </div>
        <button
          type="button"
          onClick={onRoleOutputOpen}
          className="rounded-[3px] bg-[#5865F1] px-3 py-1.5 text-xs font-medium text-[#F1F1F2] transition-colors hover:bg-[#4752c4]"
        >
          Configure
        </button>
      </div>

      <div className="h-px bg-[#3f4147]" />

      {/* Output Limit */}
      <div className="flex items-center gap-4">
        <DiscordToggle
          checked={settings.outputLimitEnabled}
          onCheckedChange={(v) => onChange({ ...settings, outputLimitEnabled: v })}
        />
        <span className="text-sm text-[#F1F1F2]">Limit to</span>
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
          className="w-16 rounded-[3px] border border-[#3f4147] bg-[#1e1f22] px-2 py-1 text-center text-sm text-[#F1F1F2] outline-none disabled:opacity-40"
        />
        <span className="text-sm text-[#F1F1F2]">output per user</span>
      </div>

      <div className="h-px bg-[#3f4147]" />

      {/* Output Locations */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#F1F1F2]">Output Locations</p>
            <p className="text-xs text-[#C7C6CB]">
              {settings.outputLocations.length}/2 locations configured
            </p>
          </div>
          {settings.outputLocations.length < 2 && (
            <button
              type="button"
              onClick={onAddLocation}
              className="rounded-[3px] border border-[#3f4147] bg-transparent px-3 py-1.5 text-xs text-[#C7C6CB] transition-colors hover:bg-[#3f4147] hover:text-[#F1F1F2]"
            >
              + Add Location
            </button>
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
// SaveBar
// ---------------------------------------------------------------------------

interface SaveBarProps {
  title: string;
  isDirty: boolean;
  onSave: () => void;
  onReset: () => void;
}

function SaveBar({ title, isDirty, onSave, onReset }: SaveBarProps) {
  const hasTitle = title.trim().length > 0;

  if (!isDirty) return null;

  return (
    <div className="fixed bottom-5 left-[56px] right-0 z-50 px-5 animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div
        className="flex items-center rounded-[8px] px-5 py-4"
        style={{
          backgroundColor: "#2B2D31",
          boxShadow: "0 8px 16px rgba(0,0,0,0.32), 0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        {/* Message */}
        <p className="text-[14px] font-[500] text-[#DBDEE1]">
          Careful — you have unsaved changes!
        </p>

        {/* Buttons */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="rounded-[4px] bg-transparent px-4 py-[6px] text-[14px] font-medium text-[#DBDEE1] transition-colors duration-150 hover:bg-[#3F4147]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!hasTitle}
            className="rounded-[4px] bg-[#5865F2] px-4 py-[6px] text-[14px] font-medium text-white transition-colors duration-150 hover:bg-[#4752C4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DiscordModalBuilder — main export
// ---------------------------------------------------------------------------

const INITIAL_PAGES = [makePage()];
const INITIAL_SETTINGS: ModalSettings = {
  outputLimitEnabled: false,
  outputLimit: 1,
  outputLocations: [makeLocation()],
};

export function DiscordModalBuilder({ onSave, isSaving }: DiscordModalBuilderProps) {
  const [pages, setPages] = useState<ModalPage[]>(INITIAL_PAGES);
  const [settings, setSettings] = useState<ModalSettings>(INITIAL_SETTINGS);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(INITIAL_PAGES));
  const [roleRestrictDialogOpen, setRoleRestrictDialogOpen] = useState(false);
  const [roleOutputDialogOpen, setRoleOutputDialogOpen] = useState(false);

  const isDirty = JSON.stringify(pages) !== savedSnapshot;
  const modalTitle = pages[0]?.title ?? "";

  // ---- Page mutations ----

  function addPage() {
    if (pages.length >= 5) return;
    setPages((prev) => [...prev, makePage()]);
  }

  function updatePage(idx: number, page: ModalPage) {
    setPages((prev) => prev.map((p, i) => (i === idx ? page : p)));
  }

  function duplicatePage(idx: number) {
    if (pages.length >= 5) return;
    const source = pages[idx];
    if (!source) return;
    const copy: ModalPage = {
      ...source,
      id: uid(),
      components: source.components.map((c) => ({
        ...c,
        id: uid(),
        options: c.options.map((o) => ({ ...o, id: uid() })),
      })),
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

  // ---- Save / Reset ----

  function handleSave() {
    if (!modalTitle.trim()) return;
    setSavedSnapshot(JSON.stringify(pages));
    onSave?.(pages, settings);
  }

  function handleReset() {
    const initial = [makePage()];
    setPages(initial);
    setSavedSnapshot(JSON.stringify(initial));
    setSettings(INITIAL_SETTINGS);
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Page cards */}
      {pages.map((page, pageIdx) => (
        <ModalPageCard
          key={page.id}
          page={page}
          pageIndex={pageIdx}
          totalPages={pages.length}
          onChange={(updated) => updatePage(pageIdx, updated)}
          onDuplicate={() => duplicatePage(pageIdx)}
          onDelete={() => deletePage(pageIdx)}
        />
      ))}

      {/* Add Page button */}
      {pages.length < 5 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={addPage}
            className="rounded-lg border-2 border-dashed border-[#3f4147] px-8 py-3 text-sm text-[#C7C6CB] transition-colors duration-150 hover:border-[#5865F1] hover:text-[#5865F1]"
          >
            + Add Page
          </button>
          <span className="rounded-full bg-[#f0a500]/20 px-2 py-0.5 text-[11px] font-semibold text-[#f0a500]">
            Premium
          </span>
        </div>
      )}

      {/* Settings */}
      <ModalSettingsPanel
        settings={settings}
        onChange={setSettings}
        onAddLocation={addLocation}
        onUpdateLocation={updateLocation}
        onDeleteLocation={deleteLocation}
        onRoleRestrictOpen={() => setRoleRestrictDialogOpen(true)}
        onRoleOutputOpen={() => setRoleOutputDialogOpen(true)}
      />

      {/* Floating save bar */}
      <SaveBar
        title={modalTitle}
        isDirty={isDirty}
        onSave={handleSave}
        onReset={handleReset}
      />

      {/* Role Restrictions Dialog */}
      <Dialog open={roleRestrictDialogOpen} onOpenChange={setRoleRestrictDialogOpen}>
        <DialogContent className="border-[#3f4147] bg-[#232327] text-[#F1F1F2]">
          <DialogHeader>
            <DialogTitle>Role Restrictions</DialogTitle>
            <DialogDescription className="text-[#C7C6CB]">
              Only members with these roles can trigger this modal.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[#C7C6CB]">
              Role restriction configuration coming soon.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Output Dialog */}
      <Dialog open={roleOutputDialogOpen} onOpenChange={setRoleOutputDialogOpen}>
        <DialogContent className="border-[#3f4147] bg-[#232327] text-[#F1F1F2]">
          <DialogHeader>
            <DialogTitle>Update User Roles on Output</DialogTitle>
            <DialogDescription className="text-[#C7C6CB]">
              Grant or remove roles from the user upon modal submission.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[#C7C6CB]">
              Role assignment configuration coming soon.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
