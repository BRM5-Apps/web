"use client";

import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiscordMarkdown } from "@/components/discord-preview/discord-markdown";
import { ButtonPreview } from "@/components/discord-preview/button-preview";
import { discordThemes, type DiscordTheme } from "@/components/discord-preview/discord-theme";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  X,
  Sun,
  Moon,
  Image,
  Type,
  Box,
  Minus,
  Rows3,
  Link,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

export type ButtonStyle = "primary" | "secondary" | "success" | "danger";

export type C2Accessory =
  | { type: "button"; label: string; style: ButtonStyle }
  | { type: "link_button"; label: string; url: string }
  | { type: "thumbnail"; url: string };

export type C2Text = {
  id: string;
  type: "text";
  content: string;
  accessory?: C2Accessory | null;
};

export type C2Container = {
  id: string;
  type: "container";
  accentColor?: string;
  spoiler?: boolean;
  items: C2ContainerItem[];
};

export type C2MediaGallery = {
  id: string;
  type: "media_gallery";
  items: { url: string }[];
};

export type C2Separator = {
  id: string;
  type: "separator";
  spacing?: "small" | "large";
};

export type C2ActionRow = {
  id: string;
  type: "action_row";
  components: C2RowButton[];
};

export type C2RowButton = {
  id: string;
  label: string;
  style: ButtonStyle;
  url?: string;
};

export type C2ContainerItem = C2Text | C2MediaGallery | C2Separator | C2ActionRow;
export type C2TopLevelItem = C2Text | C2Container | C2MediaGallery | C2Separator | C2ActionRow;

// ── Component interface ────────────────────────────────────────────────────

export interface ComponentV2BuilderProps {
  onSave?: (items: C2TopLevelItem[]) => void;
  isSaving?: boolean;
  submitRef?: React.MutableRefObject<(() => void) | null>;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID();
}

function makeText(): C2Text {
  return { id: uid(), type: "text", content: "", accessory: null };
}

function makeContainer(): C2Container {
  return { id: uid(), type: "container", accentColor: "#5865F2", spoiler: false, items: [] };
}

function makeMediaGallery(): C2MediaGallery {
  return { id: uid(), type: "media_gallery", items: [{ url: "" }] };
}

function makeSeparator(): C2Separator {
  return { id: uid(), type: "separator", spacing: "small" };
}

function makeActionRow(): C2ActionRow {
  return { id: uid(), type: "action_row", components: [] };
}

function makeRowButton(isLink = false): C2RowButton {
  return { id: uid(), label: "Button", style: isLink ? "primary" : "primary", url: isLink ? "" : undefined };
}

function blockTypeLabel(type: C2TopLevelItem["type"] | C2ContainerItem["type"]): string {
  switch (type) {
    case "text": return "Text";
    case "container": return "Container";
    case "media_gallery": return "Media Gallery";
    case "separator": return "Separator";
    case "action_row": return "Action Row";
  }
}

function blockTypeIcon(type: C2TopLevelItem["type"] | C2ContainerItem["type"]) {
  switch (type) {
    case "text": return <Type className="h-3.5 w-3.5" />;
    case "container": return <Box className="h-3.5 w-3.5" />;
    case "media_gallery": return <Image className="h-3.5 w-3.5" />;
    case "separator": return <Minus className="h-3.5 w-3.5" />;
    case "action_row": return <Rows3 className="h-3.5 w-3.5" />;
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ── Accessory Editor ───────────────────────────────────────────────────────

interface AccessoryEditorProps {
  accessory: C2Accessory;
  onChange: (a: C2Accessory) => void;
  onRemove: () => void;
}

function AccessoryEditor({ accessory, onChange, onRemove }: AccessoryEditorProps) {
  return (
    <div className="mt-2 rounded-md border border-border bg-muted/30 p-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium capitalize text-muted-foreground">
          {accessory.type.replace("_", " ")}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Remove accessory"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {accessory.type === "button" && (
        <div className="flex gap-2">
          <Input
            placeholder="Button label"
            value={accessory.label}
            onChange={(e) => onChange({ ...accessory, label: e.target.value })}
            className="h-7 text-xs"
          />
          <Select
            value={accessory.style}
            onValueChange={(v) => onChange({ ...accessory, style: v as ButtonStyle })}
          >
            <SelectTrigger className="h-7 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="danger">Danger</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {accessory.type === "link_button" && (
        <div className="flex flex-col gap-1.5">
          <Input
            placeholder="Button label"
            value={accessory.label}
            onChange={(e) => onChange({ ...accessory, label: e.target.value })}
            className="h-7 text-xs"
          />
          <Input
            placeholder="https://..."
            value={accessory.url}
            onChange={(e) => onChange({ ...accessory, url: e.target.value })}
            className="h-7 text-xs"
          />
        </div>
      )}

      {accessory.type === "thumbnail" && (
        <div className="flex flex-col gap-1.5">
          <Input
            placeholder="Image URL"
            value={accessory.url}
            onChange={(e) => onChange({ ...accessory, url: e.target.value })}
            className="h-7 text-xs"
          />
          {isValidUrl(accessory.url) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={accessory.url}
              alt="Thumbnail preview"
              className="h-16 w-16 rounded object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Add Accessory Dropdown ─────────────────────────────────────────────────

interface AddAccessoryDropdownProps {
  onAdd: (a: C2Accessory) => void;
}

function AddAccessoryDropdown({ onAdd }: AddAccessoryDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="mt-1.5 h-6 gap-1 text-xs">
          <Plus className="h-3 w-3" />
          Add Accessory
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onAdd({ type: "button", label: "Click me", style: "primary" })}>
          <Rows3 className="mr-2 h-3.5 w-3.5" />
          Button
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdd({ type: "link_button", label: "Visit", url: "" })}>
          <Link className="mr-2 h-3.5 w-3.5" />
          Link Button
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdd({ type: "thumbnail", url: "" })}>
          <Image className="mr-2 h-3.5 w-3.5" />
          Thumbnail
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Text Block Editor ──────────────────────────────────────────────────────

interface TextEditorProps {
  block: C2Text;
  onChange: (b: C2Text) => void;
}

function TextEditor({ block, onChange }: TextEditorProps) {
  return (
    <div className="flex flex-col gap-1">
      <textarea
        className="min-h-[72px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        placeholder="Enter text content..."
        value={block.content}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
      />
      {block.accessory ? (
        <AccessoryEditor
          accessory={block.accessory}
          onChange={(a) => onChange({ ...block, accessory: a })}
          onRemove={() => onChange({ ...block, accessory: null })}
        />
      ) : (
        <AddAccessoryDropdown onAdd={(a) => onChange({ ...block, accessory: a })} />
      )}
    </div>
  );
}

// ── Media Gallery Editor ───────────────────────────────────────────────────

interface MediaGalleryEditorProps {
  block: C2MediaGallery;
  onChange: (b: C2MediaGallery) => void;
}

function MediaGalleryEditor({ block, onChange }: MediaGalleryEditorProps) {
  function updateItem(index: number, url: string) {
    const next = block.items.map((it, i) => (i === index ? { url } : it));
    onChange({ ...block, items: next });
  }

  function removeItem(index: number) {
    onChange({ ...block, items: block.items.filter((_, i) => i !== index) });
  }

  function addItem() {
    onChange({ ...block, items: [...block.items, { url: "" }] });
  }

  return (
    <div className="flex flex-col gap-1.5">
      {block.items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <Input
            placeholder="Image URL"
            value={item.url}
            onChange={(e) => updateItem(i, e.target.value)}
            className="h-7 text-xs"
          />
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <Button variant="ghost" size="sm" className="h-6 w-fit gap-1 text-xs" onClick={addItem}>
        <Plus className="h-3 w-3" />
        Add Image
      </Button>
    </div>
  );
}

// ── Separator Editor ───────────────────────────────────────────────────────

interface SeparatorEditorProps {
  block: C2Separator;
  onChange: (b: C2Separator) => void;
}

function SeparatorEditor({ block, onChange }: SeparatorEditorProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground">Spacing:</span>
      <label className="flex cursor-pointer items-center gap-1 text-xs">
        <input
          type="radio"
          name={`sep-spacing-${block.id}`}
          value="small"
          checked={(block.spacing ?? "small") === "small"}
          onChange={() => onChange({ ...block, spacing: "small" })}
          className="accent-primary"
        />
        Small
      </label>
      <label className="flex cursor-pointer items-center gap-1 text-xs">
        <input
          type="radio"
          name={`sep-spacing-${block.id}`}
          value="large"
          checked={block.spacing === "large"}
          onChange={() => onChange({ ...block, spacing: "large" })}
          className="accent-primary"
        />
        Large
      </label>
    </div>
  );
}

// ── Action Row Editor ──────────────────────────────────────────────────────

interface ActionRowEditorProps {
  block: C2ActionRow;
  onChange: (b: C2ActionRow) => void;
}

function ActionRowEditor({ block, onChange }: ActionRowEditorProps) {
  function updateBtn(id: string, patch: Partial<C2RowButton>) {
    onChange({
      ...block,
      components: block.components.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  }

  function removeBtn(id: string) {
    onChange({ ...block, components: block.components.filter((c) => c.id !== id) });
  }

  function addButton(isLink: boolean) {
    onChange({ ...block, components: [...block.components, makeRowButton(isLink)] });
  }

  return (
    <div className="flex flex-col gap-2">
      {block.components.map((btn) => (
        <div key={btn.id} className="flex flex-wrap items-center gap-1.5">
          <Input
            placeholder="Label"
            value={btn.label}
            onChange={(e) => updateBtn(btn.id, { label: e.target.value })}
            className="h-7 w-28 min-w-0 text-xs"
          />
          <Select
            value={btn.style}
            onValueChange={(v) => updateBtn(btn.id, { style: v as ButtonStyle })}
          >
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="danger">Danger</SelectItem>
            </SelectContent>
          </Select>
          {btn.url !== undefined && (
            <Input
              placeholder="https://..."
              value={btn.url ?? ""}
              onChange={(e) => updateBtn(btn.id, { url: e.target.value })}
              className="h-7 min-w-0 flex-1 text-xs"
            />
          )}
          <button
            type="button"
            onClick={() => removeBtn(btn.id)}
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive"
            aria-label="Remove button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs" onClick={() => addButton(false)}>
          <Plus className="h-3 w-3" />
          Add Button
        </Button>
        <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs" onClick={() => addButton(true)}>
          <Link className="h-3 w-3" />
          Add Link Button
        </Button>
      </div>
    </div>
  );
}

// ── Container Item Editor (nested, no move arrows) ─────────────────────────

interface ContainerItemEditorProps {
  item: C2ContainerItem;
  onChange: (item: C2ContainerItem) => void;
  onCopy: () => void;
  onDelete: () => void;
}

function ContainerItemEditor({ item, onChange, onCopy, onDelete }: ContainerItemEditorProps) {
  return (
    <div className="rounded-md border border-border border-l-2 border-l-muted bg-background/50 p-2">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {blockTypeIcon(item.type)}
          {blockTypeLabel(item.type)}
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onCopy}
            title="Copy"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:text-destructive"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {item.type === "text" && (
        <TextEditor block={item} onChange={(b) => onChange(b)} />
      )}
      {item.type === "media_gallery" && (
        <MediaGalleryEditor block={item} onChange={(b) => onChange(b)} />
      )}
      {item.type === "separator" && (
        <SeparatorEditor block={item} onChange={(b) => onChange(b)} />
      )}
      {item.type === "action_row" && (
        <ActionRowEditor block={item} onChange={(b) => onChange(b)} />
      )}
    </div>
  );
}

// ── Container Add Dropdown (no Container option) ───────────────────────────

interface AddContainerItemDropdownProps {
  onAdd: (item: C2ContainerItem) => void;
}

function AddContainerItemDropdown({ onAdd }: AddContainerItemDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-fit gap-1 text-xs">
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onAdd(makeText())}>
          <Type className="mr-2 h-3.5 w-3.5" />
          Content
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdd(makeMediaGallery())}>
          <Image className="mr-2 h-3.5 w-3.5" />
          Media Gallery
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdd(makeSeparator())}>
          <Minus className="mr-2 h-3.5 w-3.5" />
          Separator
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdd(makeActionRow())}>
          <Rows3 className="mr-2 h-3.5 w-3.5" />
          Row
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Container Block Editor ─────────────────────────────────────────────────

interface ContainerEditorProps {
  block: C2Container;
  onChange: (b: C2Container) => void;
}

function ContainerEditor({ block, onChange }: ContainerEditorProps) {
  function updateItem(index: number, item: C2ContainerItem) {
    onChange({ ...block, items: block.items.map((it, i) => (i === index ? item : it)) });
  }

  function copyItem(index: number) {
    const copy: C2ContainerItem = { ...block.items[index], id: uid() } as C2ContainerItem;
    const next = [...block.items];
    next.splice(index + 1, 0, copy);
    onChange({ ...block, items: next });
  }

  function deleteItem(index: number) {
    onChange({ ...block, items: block.items.filter((_, i) => i !== index) });
  }

  function addItem(item: C2ContainerItem) {
    onChange({ ...block, items: [...block.items, item] });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label htmlFor={`accent-${block.id}`} className="text-xs text-muted-foreground">
            Accent color
          </label>
          <input
            id={`accent-${block.id}`}
            type="color"
            value={block.accentColor ?? "#5865F2"}
            onChange={(e) => onChange({ ...block, accentColor: e.target.value })}
            className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent p-0"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Switch
            id={`spoiler-${block.id}`}
            checked={block.spoiler ?? false}
            onCheckedChange={(v) => onChange({ ...block, spoiler: v })}
          />
          <Label htmlFor={`spoiler-${block.id}`} className="cursor-pointer text-xs">
            Spoiler
          </Label>
        </div>
      </div>

      {block.items.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-md border border-dashed border-border p-2">
          {block.items.map((item, idx) => (
            <ContainerItemEditor
              key={item.id}
              item={item}
              onChange={(updated) => updateItem(idx, updated)}
              onCopy={() => copyItem(idx)}
              onDelete={() => deleteItem(idx)}
            />
          ))}
        </div>
      )}

      <AddContainerItemDropdown onAdd={addItem} />
    </div>
  );
}

// ── Top-level Add Dropdown (includes Container) ────────────────────────────

interface AddTopLevelDropdownProps {
  onAdd: (item: C2TopLevelItem) => void;
  label?: string;
}

function AddTopLevelDropdown({ onAdd, label = "Add" }: AddTopLevelDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-fit gap-1 text-xs">
          <Plus className="h-3 w-3" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onAdd(makeText())}>
          <Type className="mr-2 h-3.5 w-3.5" />
          Content
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdd(makeContainer())}>
          <Box className="mr-2 h-3.5 w-3.5" />
          Container
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdd(makeMediaGallery())}>
          <Image className="mr-2 h-3.5 w-3.5" />
          Media Gallery
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdd(makeSeparator())}>
          <Minus className="mr-2 h-3.5 w-3.5" />
          Separator
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdd(makeActionRow())}>
          <Rows3 className="mr-2 h-3.5 w-3.5" />
          Row
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Top-level Block Wrapper ────────────────────────────────────────────────

interface TopLevelBlockProps {
  item: C2TopLevelItem;
  index: number;
  total: number;
  onChange: (item: C2TopLevelItem) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onInsertAfter: (item: C2TopLevelItem) => void;
}

function TopLevelBlock({
  item,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onCopy,
  onDelete,
  onInsertAfter,
}: TopLevelBlockProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="rounded-md border border-border border-l-2 border-l-muted bg-card p-3">
        {/* Block header */}
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            {blockTypeIcon(item.type)}
            {blockTypeLabel(item.type)}
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onMoveUp}
              disabled={index === 0}
              title="Move up"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onMoveDown}
              disabled={index === total - 1}
              title="Move down"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onCopy}
              title="Copy"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:text-destructive"
              onClick={onDelete}
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Inline editor */}
        {item.type === "text" && (
          <TextEditor block={item} onChange={(b) => onChange(b)} />
        )}
        {item.type === "container" && (
          <ContainerEditor block={item} onChange={(b) => onChange(b)} />
        )}
        {item.type === "media_gallery" && (
          <MediaGalleryEditor block={item} onChange={(b) => onChange(b)} />
        )}
        {item.type === "separator" && (
          <SeparatorEditor block={item} onChange={(b) => onChange(b)} />
        )}
        {item.type === "action_row" && (
          <ActionRowEditor block={item} onChange={(b) => onChange(b)} />
        )}
      </div>

      {/* Insert-after dropdown */}
      <div className="flex justify-start pl-1">
        <AddTopLevelDropdown onAdd={onInsertAfter} label="+ Add" />
      </div>

      <div className="my-0.5 border-t border-dashed border-border" />
    </div>
  );
}

// ── Preview: render a single C2ContainerItem or C2TopLevelItem ─────────────

interface PreviewItemProps {
  item: C2ContainerItem | C2TopLevelItem;
  theme: DiscordTheme;
}

function PreviewItem({ item, theme }: PreviewItemProps) {
  const tokens = discordThemes[theme];

  if (item.type === "text") {
    const hasThumbnail = item.accessory?.type === "thumbnail";
    const hasButton =
      item.accessory?.type === "button" || item.accessory?.type === "link_button";

    return (
      <div className="relative">
        <div className={cn("flex", hasThumbnail && "pr-20")}>
          <div className="flex-1">
            {item.content ? (
              <DiscordMarkdown content={item.content} />
            ) : (
              <span className="text-xs italic" style={{ color: tokens.textMuted }}>
                Empty text block
              </span>
            )}
          </div>
          {hasThumbnail && item.accessory?.type === "thumbnail" && isValidUrl(item.accessory.url) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.accessory.url}
              alt="Thumbnail"
              className="absolute right-0 top-0 h-16 w-16 rounded object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
        </div>
        {hasButton && (
          <div className="mt-2">
            {item.accessory?.type === "button" && (
              <ButtonPreview label={item.accessory.label} style={item.accessory.style} />
            )}
            {item.accessory?.type === "link_button" && (
              <ButtonPreview label={item.accessory.label} style="primary" />
            )}
          </div>
        )}
      </div>
    );
  }

  if (item.type === "media_gallery") {
    const validItems = item.items.filter((it) => isValidUrl(it.url));
    return (
      <div className={cn("grid gap-1", validItems.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
        {validItems.length > 0 ? (
          validItems.map((it, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={it.url}
              alt={`Gallery image ${i + 1}`}
              className="w-full rounded object-cover"
              style={{ maxHeight: 200 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ))
        ) : (
          <div
            className="flex h-16 items-center justify-center rounded border border-dashed text-xs"
            style={{ borderColor: tokens.separatorColor, color: tokens.textMuted }}
          >
            No images
          </div>
        )}
      </div>
    );
  }

  if (item.type === "separator") {
    return (
      <hr
        className={cn("border-0 border-t", item.spacing === "large" ? "my-4" : "my-2")}
        style={{ borderColor: tokens.separatorColor }}
      />
    );
  }

  if (item.type === "action_row") {
    return (
      <div className="flex flex-wrap gap-2">
        {item.components.map((btn) => (
          <ButtonPreview key={btn.id} label={btn.label} style={btn.style} />
        ))}
        {item.components.length === 0 && (
          <span className="text-xs italic" style={{ color: tokens.textMuted }}>
            No buttons
          </span>
        )}
      </div>
    );
  }

  if (item.type === "container") {
    const spoilerClass = item.spoiler ? "blur-sm" : "";
    return (
      <div
        className="relative overflow-hidden rounded-md"
        style={{
          backgroundColor: tokens.containerBg,
          border: `1px solid ${tokens.containerBorder}`,
        }}
      >
        {item.accentColor && (
          <div
            className="absolute left-0 top-0 h-full w-1"
            style={{ backgroundColor: item.accentColor }}
          />
        )}
        <div className={cn("flex flex-col gap-2 p-3 pl-4", spoilerClass)}>
          {item.items.length > 0 ? (
            item.items.map((nested) => (
              <PreviewItem key={nested.id} item={nested} theme={theme} />
            ))
          ) : (
            <span className="text-xs italic" style={{ color: tokens.textMuted }}>
              Empty container
            </span>
          )}
        </div>
        {item.spoiler && (
          <div
            className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-md text-xs font-medium"
            style={{ backgroundColor: `${tokens.containerBg}cc`, color: tokens.textSecondary }}
          >
            Spoiler — click to reveal
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ── Main Component ─────────────────────────────────────────────────────────

export function ComponentV2Builder({ onSave, isSaving, submitRef }: ComponentV2BuilderProps) {
  const [items, setItems] = useState<C2TopLevelItem[]>([]);
  const [templateName, setTemplateName] = useState("Component V2 Template");
  const [previewTheme, setPreviewTheme] = useState<DiscordTheme>("dark");

  const tokens = discordThemes[previewTheme];

  // Wire up submitRef
  useEffect(() => {
    if (!submitRef) return;
    submitRef.current = () => onSave?.(items);
    return () => {
      submitRef.current = null;
    };
  }, [submitRef, items, onSave]);

  // ── Item mutation helpers ──

  function updateItem(index: number, item: C2TopLevelItem) {
    setItems((prev) => prev.map((it, i) => (i === index ? item : it)));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    setItems((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function copyItem(index: number) {
    setItems((prev) => {
      const copy: C2TopLevelItem = { ...prev[index], id: uid() } as C2TopLevelItem;
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
  }

  function deleteItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function insertAfter(index: number, item: C2TopLevelItem) {
    setItems((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, item);
      return next;
    });
  }

  function appendItem(item: C2TopLevelItem) {
    setItems((prev) => [...prev, item]);
  }

  // ── Render ──

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {/* LEFT: Editor */}
      <div className="flex flex-col gap-0">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Components</h2>
        </div>

        <Card className="overflow-hidden">
          <ScrollArea style={{ maxHeight: "calc(100vh - 200px)" }}>
            <div className="flex flex-col gap-2 p-4">
              {/* Template name */}
              <div className="mb-2 flex flex-col gap-1">
                <Label htmlFor="template-name" className="text-xs text-muted-foreground">
                  Template name
                </Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="Component V2 Template"
                />
              </div>

              <Separator className="my-1" />

              {/* Block list */}
              {items.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                  <Box className="h-8 w-8 opacity-30" />
                  <p className="text-sm">No components yet</p>
                  <p className="text-xs opacity-70">Use the button below to add your first block</p>
                </div>
              )}

              {items.map((item, idx) => (
                <TopLevelBlock
                  key={item.id}
                  item={item}
                  index={idx}
                  total={items.length}
                  onChange={(updated) => updateItem(idx, updated)}
                  onMoveUp={() => moveUp(idx)}
                  onMoveDown={() => moveDown(idx)}
                  onCopy={() => copyItem(idx)}
                  onDelete={() => deleteItem(idx)}
                  onInsertAfter={(newItem) => insertAfter(idx, newItem)}
                />
              ))}

              {/* Final append button */}
              <div className="pt-1">
                <AddTopLevelDropdown onAdd={appendItem} label="Add block" />
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* RIGHT: Preview */}
      <div className="flex flex-col gap-0">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Preview</h2>
          <button
            type="button"
            onClick={() => setPreviewTheme((t) => (t === "dark" ? "light" : "dark"))}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Toggle preview theme"
          >
            {previewTheme === "dark" ? (
              <>
                <Moon className="h-3.5 w-3.5" />
                Dark
              </>
            ) : (
              <>
                <Sun className="h-3.5 w-3.5" />
                Light
              </>
            )}
          </button>
        </div>

        <Card className="overflow-hidden">
          <ScrollArea style={{ maxHeight: "calc(100vh - 200px)" }}>
            <div
              className="min-h-[200px] p-4"
              style={{ backgroundColor: tokens.messageBg }}
            >
              {items.length === 0 ? (
                <div
                  className="flex flex-col items-center gap-2 py-12 text-center text-sm"
                  style={{ color: tokens.textMuted }}
                >
                  <Box className="h-8 w-8 opacity-20" />
                  <p>Your component preview will appear here</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <PreviewItem key={item.id} item={item} theme={previewTheme} />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
