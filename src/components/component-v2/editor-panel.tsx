"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Plus,
  Keyboard,
  ExternalLink,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonEditDialog } from "./button-edit-dialog";
import { LinkButtonEditDialog } from "./link-button-edit-dialog";
import { SelectMenuEditDialog } from "./select-menu-edit-dialog";
import type {
  C2TopLevelItem,
  C2ContainerChild,
  C2Container,
  C2Text,
  C2Row,
  C2MediaGallery,
  C2File,
  C2Separator,
  C2Button,
  C2LinkButton,
  C2SelectMenu,
  C2SelectMenuType,
  C2RowComponent,
  C2Section,
  C2SectionContent,
  C2Thumbnail,
} from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID();
}

function makeButton(): C2Button {
  return {
    id: uid(),
    type: "button",
    label: "Button",
    style: "blurple",
    disabled: false,
    flow: [],
  };
}

function makeLinkButton(): C2LinkButton {
  return { id: uid(), type: "link_button", label: "Link", url: "", disabled: false };
}

function makeSelectMenu(menuType: C2SelectMenuType): C2SelectMenu {
  return {
    id: uid(),
    type: "select_menu",
    menuType,
    placeholder: "",
    minValues: 1,
    maxValues: 1,
    disabled: false,
    options: [],
    defaultValues: [],
    flow: [],
  };
}

// ── Row constraints ────────────────────────────────────────────────────────────

function hasSelectMenu(components: C2RowComponent[]): boolean {
  return components.some((c) => c.type === "select_menu");
}

function buttonCount(components: C2RowComponent[]): number {
  return components.filter((c) => c.type === "button" || c.type === "link_button").length;
}

function canAddButton(components: C2RowComponent[]): boolean {
  return !hasSelectMenu(components) && buttonCount(components) < 5;
}

function canAddSelect(components: C2RowComponent[]): boolean {
  return components.length === 0;
}

function makeRow(): C2Row {
  return { id: uid(), type: "row", components: [makeButton()] };
}

function makeText(): C2Text {
  return { id: uid(), type: "text", content: "" };
}

function makeMediaGallery(): C2MediaGallery {
  return { id: uid(), type: "media_gallery", items: [] };
}

function makeFile(): C2File {
  return { id: uid(), type: "file" };
}

function makeSeparator(): C2Separator {
  return { id: uid(), type: "separator", size: "small", dividerLine: true };
}

function makeSectionContent(): C2SectionContent {
  return { id: uid(), content: "" };
}

function makeThumbnail(): C2Thumbnail {
  return { id: uid(), type: "thumbnail", url: "" };
}

function makeSection(sectionNumber: number): C2Section {
  return {
    id: uid(),
    type: "section",
    label: `Section ${sectionNumber}`,
    contents: [makeSectionContent()],
    accessory: undefined,
  };
}

function isGifUrl(url: string): boolean {
  return /\.gif(\?|$)/i.test(url);
}

function makeContainer(): C2Container {
  return {
    id: uid(),
    type: "container",
    spoiler: false,
    accentColor: undefined,
    collapsed: false,
    children: [],
  };
}

function childTypeLabel(type: C2ContainerChild["type"]): string {
  switch (type) {
    case "text":
      return "Content";
    case "row":
      return "Row";
    case "media_gallery":
      return "Media Gallery";
    case "file":
      return "File";
    case "separator":
      return "Separator";
    case "section":
      return "Section";
  }
}

function topLevelTypeLabel(type: C2TopLevelItem["type"]): string {
  if (type === "container") return "Container";
  return childTypeLabel(type as C2ContainerChild["type"]);
}

// ── TextChildEditor ───────────────────────────────────────────────────────────

interface TextChildEditorProps {
  child: C2Text;
  onChange: (updated: C2Text) => void;
  onAddAccessory?: (type: "button" | "link_button" | "thumbnail") => void;
}

function TextChildEditor({ child, onChange, onAddAccessory }: TextChildEditorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label className="text-xs text-gray-400">
          Content <span className="text-red-500">*</span>
        </Label>
        <span className="text-xs italic text-gray-500">
          {child.content.length}/4000
        </span>
      </div>
      <textarea
        value={child.content}
        onChange={(e) =>
          onChange({ ...child, content: e.target.value.slice(0, 4000) })
        }
        rows={4}
        placeholder="Enter text content..."
        className={cn(
          "w-full resize-y rounded bg-[#1e1f22] border px-2 py-1.5 text-sm text-white placeholder:text-gray-500 outline-none",
          child.content === "" ? "border-red-500/70" : "border-[#3f4147]"
        )}
      />
      {onAddAccessory && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-6 text-xs text-gray-400 hover:text-white"
            >
              + Add Accessory ▾
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#2b2d31] border-[#3f4147] text-white">
            <DropdownMenuItem
              onClick={() => onAddAccessory("button")}
              className="text-xs cursor-pointer"
            >
              Button
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAddAccessory("link_button")}
              className="text-xs cursor-pointer"
            >
              Link Button
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAddAccessory("thumbnail")}
              className="text-xs cursor-pointer"
            >
              Thumbnail
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// ── RowButtonItem ─────────────────────────────────────────────────────────────

interface RowButtonItemProps {
  button: C2Button;
  onChange: (updated: C2Button) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  serverId?: string;
}

function RowButtonItem({
  button,
  onChange,
  onDuplicate,
  onDelete,
  serverId,
}: RowButtonItemProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div
        className="flex items-center gap-2 rounded bg-[#1e1f22] px-2 py-1.5 cursor-pointer hover:bg-[#3f4147] group"
        onClick={() => setEditOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setEditOpen(true);
        }}
      >
        <span className="h-3 w-3 rounded-sm bg-[#5865F2] flex-shrink-0" />
        <span className="flex-1 text-sm text-white truncate">
          {button.label || "Button"}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          title="Duplicate"
        >
          <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-white" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </div>
      <ButtonEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        button={button}
        onChange={onChange}
        serverId={serverId}
      />
    </>
  );
}

// ── RowLinkButtonItem ─────────────────────────────────────────────────────────

interface RowLinkButtonItemProps {
  btn: C2LinkButton;
  onChange: (updated: C2LinkButton) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function RowLinkButtonItem({ btn, onChange, onDuplicate, onDelete }: RowLinkButtonItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="flex items-center gap-2 rounded bg-[#1e1f22] px-2 py-1.5 cursor-pointer hover:bg-[#3f4147] group"
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(true); }}
      >
        <span className="h-3 w-3 rounded-sm bg-[#4e5058] flex-shrink-0" title="Link Button" />
        <span className="flex-1 text-sm text-white truncate">{btn.label || "Link"}</span>
        {btn.url && (
          <span className="text-xs text-gray-500 truncate max-w-[100px]">{btn.url}</span>
        )}
        <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="opacity-0 group-hover:opacity-100 transition-opacity" title="Duplicate">
          <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-white" />
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400" title="Delete">
          <Trash2 className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </div>
      {open && (
        <div className="rounded border border-[#3f4147] bg-[#2b2d31] p-3 space-y-2 text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Edit Link Button</span>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-gray-500 hover:text-white">✕</button>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Label</label>
            <input
              value={btn.label}
              onChange={(e) => onChange({ ...btn, label: e.target.value.slice(0, 80) })}
              className="w-full rounded bg-[#1e1f22] border border-[#3f4147] px-2 py-1 text-sm text-white outline-none"
              placeholder="Link"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">URL</label>
            <input
              value={btn.url}
              onChange={(e) => onChange({ ...btn, url: e.target.value })}
              className="w-full rounded bg-[#1e1f22] border border-[#3f4147] px-2 py-1 text-sm text-white outline-none"
              placeholder="https://example.com"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" checked={btn.disabled} onChange={(e) => onChange({ ...btn, disabled: e.target.checked })} className="accent-[#5865F2]" />
            Disabled
          </label>
        </div>
      )}
    </>
  );
}

// ── RowSelectMenuItem ─────────────────────────────────────────────────────────

const SELECT_MENU_LABELS: Record<C2SelectMenuType, string> = {
  select: "Select Menu",
  user_select: "User Select",
  role_select: "Role Select",
  user_role_select: "User & Role Select",
  channel_select: "Channel Select",
};

interface RowSelectMenuItemProps {
  menu: C2SelectMenu;
  onChange: (updated: C2SelectMenu) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  serverId?: string;
}

function RowSelectMenuItem({ menu, onChange, onDuplicate, onDelete, serverId }: RowSelectMenuItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="flex items-center gap-2 rounded bg-[#1e1f22] px-2 py-1.5 cursor-pointer hover:bg-[#3f4147] group"
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(true); }}
      >
        <span className="h-3 w-3 rounded-sm bg-[#248046] flex-shrink-0" title="Select Menu" />
        <span className="flex-1 text-sm text-white truncate">{SELECT_MENU_LABELS[menu.menuType]}</span>
        {menu.placeholder && (
          <span className="text-xs text-gray-500 truncate max-w-[120px] italic">{menu.placeholder}</span>
        )}
        <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="opacity-0 group-hover:opacity-100 transition-opacity" title="Duplicate">
          <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-white" />
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400" title="Delete">
          <Trash2 className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </div>
      <SelectMenuEditDialog
        open={open}
        onOpenChange={setOpen}
        menu={menu}
        onChange={onChange}
        serverId={serverId}
      />
    </>
  );
}

// ── RowChildEditor ────────────────────────────────────────────────────────────

interface RowChildEditorProps {
  child: C2Row;
  onChange: (updated: C2Row) => void;
  serverId?: string;
}

function RowChildEditor({ child, onChange, serverId }: RowChildEditorProps) {
  const _canAddButton = canAddButton(child.components);
  const _canAddSelect = canAddSelect(child.components);

  function updateComponent(idx: number, updated: C2RowComponent) {
    onChange({ ...child, components: child.components.map((c, i) => (i === idx ? updated : c)) });
  }

  function duplicateComponent(idx: number) {
    const copy: C2RowComponent = { ...child.components[idx], id: crypto.randomUUID() } as C2RowComponent;
    const next = [...child.components];
    next.splice(idx + 1, 0, copy);
    onChange({ ...child, components: next });
  }

  function deleteComponent(idx: number) {
    onChange({ ...child, components: child.components.filter((_, i) => i !== idx) });
  }

  function addComponent(comp: C2RowComponent) {
    onChange({ ...child, components: [...child.components, comp] });
  }

  return (
    <div>
      {child.components.length === 0 && (
        <div className="mb-2 flex items-center gap-2 rounded border border-red-500/60 bg-red-900/20 px-2 py-1.5 text-xs text-red-400">
          ⚠ Must contain at least one component (button/select)
        </div>
      )}
      <div className="space-y-1.5">
        {child.components.map((comp, idx) => {
          if (comp.type === "button") {
            return (
              <RowButtonItem
                key={comp.id}
                button={comp}
                onChange={(updated) => updateComponent(idx, updated)}
                onDuplicate={() => duplicateComponent(idx)}
                onDelete={() => deleteComponent(idx)}
                serverId={serverId}
              />
            );
          }
          if (comp.type === "link_button") {
            return (
              <RowLinkButtonItem
                key={comp.id}
                btn={comp}
                onChange={(updated) => updateComponent(idx, updated)}
                onDuplicate={() => duplicateComponent(idx)}
                onDelete={() => deleteComponent(idx)}
              />
            );
          }
          if (comp.type === "select_menu") {
            return (
              <RowSelectMenuItem
                key={comp.id}
                menu={comp}
                onChange={(updated) => updateComponent(idx, updated)}
                onDuplicate={() => duplicateComponent(idx)}
                onDelete={() => deleteComponent(idx)}
                serverId={serverId}
              />
            );
          }
          return null;
        })}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-6 text-xs text-gray-400 hover:text-white"
          >
            + Add Component ▾
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#2b2d31] border-[#3f4147] text-white">
          <DropdownMenuItem
            onClick={() => addComponent(makeButton())}
            disabled={!_canAddButton}
            className={cn("text-xs cursor-pointer", !_canAddButton && "opacity-40 cursor-not-allowed")}
          >
            Button
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => addComponent(makeLinkButton())}
            disabled={!_canAddButton}
            className={cn("text-xs cursor-pointer", !_canAddButton && "opacity-40 cursor-not-allowed")}
          >
            Link Button
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => addComponent(makeSelectMenu("select"))}
            disabled={!_canAddSelect}
            className={cn("text-xs cursor-pointer", !_canAddSelect && "opacity-40 cursor-not-allowed")}
          >
            Select Menu
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => addComponent(makeSelectMenu("user_select"))}
            disabled={!_canAddSelect}
            className={cn("text-xs cursor-pointer", !_canAddSelect && "opacity-40 cursor-not-allowed")}
          >
            User Select Menu
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => addComponent(makeSelectMenu("role_select"))}
            disabled={!_canAddSelect}
            className={cn("text-xs cursor-pointer", !_canAddSelect && "opacity-40 cursor-not-allowed")}
          >
            Role Select Menu
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => addComponent(makeSelectMenu("user_role_select"))}
            disabled={!_canAddSelect}
            className={cn("text-xs cursor-pointer", !_canAddSelect && "opacity-40 cursor-not-allowed")}
          >
            User &amp; Role Select Menu
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => addComponent(makeSelectMenu("channel_select"))}
            disabled={!_canAddSelect}
            className={cn("text-xs cursor-pointer", !_canAddSelect && "opacity-40 cursor-not-allowed")}
          >
            Channel Select Menu
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── MediaGalleryChildEditor ───────────────────────────────────────────────────

interface MediaGalleryChildEditorProps {
  child: C2MediaGallery;
  onChange: (updated: C2MediaGallery) => void;
}

function MediaGalleryChildEditor({
  child,
  onChange,
}: MediaGalleryChildEditorProps) {
  void child;
  void onChange;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-xs text-[#5865F2] border border-[#5865F2]/40 hover:bg-[#5865F2]/10"
    >
      + Add Media
    </Button>
  );
}

// ── FileChildEditor ───────────────────────────────────────────────────────────

interface FileChildEditorProps {
  child: C2File;
  onChange: (updated: C2File) => void;
}

function FileChildEditor({ child, onChange }: FileChildEditorProps) {
  void child;
  void onChange;
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="h-7 text-xs bg-[#5865F2] hover:bg-[#4752c4] text-white"
      >
        + Add File
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs border-[#3f4147] text-gray-300"
      >
        Paste File
      </Button>
    </div>
  );
}

// ── SeparatorChildEditor ──────────────────────────────────────────────────────

interface SeparatorChildEditorProps {
  child: C2Separator;
  onChange: (updated: C2Separator) => void;
}

function SeparatorChildEditor({ child, onChange }: SeparatorChildEditorProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex rounded border border-[#3f4147] overflow-hidden">
        {(["small", "large"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange({ ...child, size: s })}
            className={cn(
              "px-3 py-1 text-xs font-medium transition-colors",
              child.size === s
                ? "bg-[#5865F2] text-white"
                : "bg-[#1e1f22] text-gray-400 hover:text-white"
            )}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
        <input
          type="checkbox"
          checked={child.dividerLine}
          onChange={(e) => onChange({ ...child, dividerLine: e.target.checked })}
          className="accent-[#5865F2]"
        />
        Divider Line
      </label>
    </div>
  );
}

// ── SectionEditor ─────────────────────────────────────────────────────────────

interface SectionEditorProps {
  section: C2Section;
  index: number;
  total: number;
  onChange: (updated: C2Section | C2Text) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function SectionEditor({
  section,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: SectionEditorProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [linkBtnDialogOpen, setLinkBtnDialogOpen] = useState(false);
  const [btnAccessoryDialogOpen, setBtnAccessoryDialogOpen] = useState(false);

  function updateContent(contentIdx: number, value: string) {
    onChange({
      ...section,
      contents: section.contents.map((c, i) =>
        i === contentIdx ? { ...c, content: value } : c
      ),
    });
  }

  function addContent() {
    onChange({ ...section, contents: [...section.contents, makeSectionContent()] });
  }

  function deleteContent(contentIdx: number) {
    if (section.contents.length <= 1) return;
    onChange({ ...section, contents: section.contents.filter((_, i) => i !== contentIdx) });
  }

  function removeAccessory() {
    // Revert the section back to a plain text block with the combined content
    const combinedContent = section.contents.map((c) => c.content).join("\n\n");
    onChange({ id: section.id, type: "text", content: combinedContent });
  }

  function updateThumbnailUrl(url: string) {
    if (!section.accessory || section.accessory.type !== "thumbnail") return;
    onChange({ ...section, accessory: { ...section.accessory, url } });
  }

  function updateLinkButton(updated: C2LinkButton) {
    onChange({ ...section, accessory: updated });
  }

  function updateButtonAccessory(updated: C2Button) {
    onChange({ ...section, accessory: updated });
  }

  const gifDetected =
    section.accessory?.type === "thumbnail" && isGifUrl(section.accessory.url);

  return (
    <div className="rounded-lg border border-[#3f4147] bg-[#2b2d31] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e1f22]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white"
          >
            <ChevronRight
              className={cn("h-4 w-4 transition-transform", !collapsed && "rotate-90")}
            />
          </button>
          <span className="text-sm font-semibold text-white">{section.label}</span>
        </div>
        <div className="flex items-center gap-1">
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
            <ChevronUp className="h-4 w-4" />
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
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-red-400 hover:bg-[#3f4147]"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="p-3">
          <div className="flex flex-col gap-3">
            {/* Content blocks */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-400">Content</span>
              {section.contents.map((c, contentIdx) => (
                <div key={c.id} className="flex items-start gap-1">
                  <div className="flex-1 relative">
                    <textarea
                      value={c.content}
                      onChange={(e) => updateContent(contentIdx, e.target.value.slice(0, 4000))}
                      rows={3}
                      placeholder="Enter text content..."
                      className={cn(
                        "w-full resize-y rounded bg-[#1e1f22] border px-2 py-1.5 pb-6 text-sm text-white placeholder:text-gray-500 outline-none",
                        c.content === "" ? "border-red-500/70" : "border-[#3f4147]"
                      )}
                    />
                    <div className="absolute bottom-1 right-1 flex items-center gap-1">
                      <span className="text-xs italic text-gray-600">{c.content.length}/4000</span>
                      <button
                        type="button"
                        title="Variables / keyboard shortcuts"
                        className="flex h-5 w-5 items-center justify-center rounded text-gray-500 hover:text-gray-300"
                      >
                        <Keyboard className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => deleteContent(contentIdx)}
                      disabled={section.contents.length <= 1}
                      title="Delete text block"
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-red-400 hover:bg-[#3f4147]",
                        section.contents.length <= 1 && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={addContent}
                      title="Add text block"
                      className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-[#5865F2] hover:bg-[#3f4147]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Accessory */}
            {section.accessory ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">
                    Accessory –{" "}
                    {section.accessory.type === "link_button" ? "Link Button" : "Thumbnail"}
                  </span>
                  <button
                    type="button"
                    onClick={removeAccessory}
                    title="Remove accessory"
                    className="flex h-5 w-5 items-center justify-center rounded text-gray-500 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>

                {section.accessory.type === "button" && (
                  <>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setBtnAccessoryDialogOpen(true)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setBtnAccessoryDialogOpen(true); }}
                      className="flex items-center gap-2 rounded bg-[#1e1f22] px-2 py-1.5 cursor-pointer hover:bg-[#3f4147] group"
                    >
                      <span className="h-3 w-3 rounded-sm bg-[#5865F2] flex-shrink-0" />
                      <span className="flex-1 text-sm text-white truncate">
                        {section.accessory.label || "Button"}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">{section.accessory.style}</span>
                    </div>
                    <ButtonEditDialog
                      open={btnAccessoryDialogOpen}
                      onOpenChange={setBtnAccessoryDialogOpen}
                      button={section.accessory as C2Button}
                      onChange={updateButtonAccessory}
                    />
                  </>
                )}

                {section.accessory.type === "link_button" && (
                  <>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setLinkBtnDialogOpen(true)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setLinkBtnDialogOpen(true); }}
                      className="flex items-center gap-2 rounded bg-[#1e1f22] px-2 py-1.5 cursor-pointer hover:bg-[#3f4147] group"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-[#5865F2] flex-shrink-0" />
                      <span className="flex-1 text-sm text-white truncate">
                        {section.accessory.label || "Link Button"}
                      </span>
                      {section.accessory.url && (
                        <span className="text-xs text-gray-500 truncate max-w-[120px]">
                          {section.accessory.url}
                        </span>
                      )}
                    </div>
                    <LinkButtonEditDialog
                      open={linkBtnDialogOpen}
                      onOpenChange={setLinkBtnDialogOpen}
                      btn={section.accessory as C2LinkButton}
                      onChange={updateLinkButton}
                    />
                  </>
                )}

                {section.accessory.type === "thumbnail" && (
                  <div className="space-y-2">
                    <input
                      value={section.accessory.url}
                      onChange={(e) => updateThumbnailUrl(e.target.value)}
                      className={cn(
                        "w-full rounded bg-[#1e1f22] border px-2 py-1.5 text-xs text-white outline-none placeholder:text-gray-500",
                        section.accessory.url === "" ? "border-red-500/70" : "border-[#3f4147]"
                      )}
                      placeholder="Image URL (jpg, png, webp, gif)"
                    />
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 flex-1 text-xs border-[#3f4147] text-gray-300"
                      >
                        Paste File
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 flex-1 text-xs bg-[#5865F2] hover:bg-[#4752c4] text-white"
                      >
                        Add File
                      </Button>
                    </div>
                    {gifDetected && (
                      <p className="text-xs text-yellow-400/90 bg-yellow-400/10 border border-yellow-400/20 rounded px-2 py-1">
                        GIF detected — consider converting the link so Discord displays it properly.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-xs font-medium text-gray-400">Accessory</span>
                <p className="text-xs italic text-gray-600">No accessory</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ChildItemEditor ───────────────────────────────────────────────────────────

interface ChildItemEditorProps {
  child: C2ContainerChild;
  index: number;
  total: number;
  onChange: (updated: C2ContainerChild) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  serverId?: string;
}

function ChildItemEditor({
  child,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  serverId,
}: ChildItemEditorProps) {
  if (child.type === "section") {
    return (
      <SectionEditor
        section={child}
        index={index}
        total={total}
        onChange={(updated) => onChange(updated)}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    );
  }

  return (
    <div className="rounded border border-[#3f4147] bg-[#313338] overflow-hidden">
      <div className="flex items-center justify-between px-2 py-1.5 bg-[#1e1f22]">
        <span className="text-xs font-medium text-gray-300">
          {childTypeLabel(child.type)}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]",
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
              "flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]",
              index === total - 1 && "opacity-50 cursor-not-allowed"
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
      <div className="p-2">
        {child.type === "text" && (
          <TextChildEditor
            child={child}
            onChange={(updated) => onChange(updated)}
            onAddAccessory={(accessoryType) => {
              const section: C2Section = {
                id: child.id,
                type: "section",
                label: `Section ${index + 1}`,
                contents: [{ id: uid(), content: child.content }],
                accessory:
                  accessoryType === "button"
                    ? makeButton()
                    : accessoryType === "link_button"
                    ? makeLinkButton()
                    : makeThumbnail(),
              };
              onChange(section);
            }}
          />
        )}
        {child.type === "row" && (
          <RowChildEditor
            child={child}
            onChange={(updated) => onChange(updated)}
            serverId={serverId}
          />
        )}
        {child.type === "media_gallery" && (
          <MediaGalleryChildEditor
            child={child}
            onChange={(updated) => onChange(updated)}
          />
        )}
        {child.type === "file" && (
          <FileChildEditor
            child={child}
            onChange={(updated) => onChange(updated)}
          />
        )}
        {child.type === "separator" && (
          <SeparatorChildEditor
            child={child}
            onChange={(updated) => onChange(updated)}
          />
        )}
      </div>
    </div>
  );
}

// ── AddChildDropdown ──────────────────────────────────────────────────────────

interface AddChildDropdownProps {
  onAdd: (child: C2ContainerChild) => void;
  sectionCount?: number;
}

function AddChildDropdown({ onAdd, sectionCount = 0 }: AddChildDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-gray-400 hover:text-white border border-dashed border-[#3f4147] w-full"
        >
          + Add ▾
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#2b2d31] border-[#3f4147] text-white">
        <DropdownMenuItem
          onClick={() => onAdd(makeText())}
          className="text-xs cursor-pointer"
        >
          Content
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAdd(makeMediaGallery())}
          className="text-xs cursor-pointer"
        >
          Media Gallery
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAdd(makeFile())}
          className="text-xs cursor-pointer"
        >
          File
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAdd(makeSeparator())}
          className="text-xs cursor-pointer"
        >
          Separator
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAdd(makeRow())}
          className="text-xs cursor-pointer"
        >
          Row
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAdd(makeSection(sectionCount + 1))}
          className="text-xs cursor-pointer"
        >
          Section
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── ContainerEditor ───────────────────────────────────────────────────────────

interface ContainerEditorProps {
  container: C2Container;
  index: number;
  total: number;
  onChange: (updated: C2Container) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  serverId?: string;
}

function ContainerEditor({
  container,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  serverId,
}: ContainerEditorProps) {
  function toggleCollapse() {
    onChange({ ...container, collapsed: !container.collapsed });
  }

  function updateChild(childIdx: number, updated: C2ContainerChild) {
    onChange({
      ...container,
      children: container.children.map((c, i) => (i === childIdx ? updated : c)),
    });
  }

  function moveChild(childIdx: number, direction: -1 | 1) {
    const next = [...container.children];
    const target = childIdx + direction;
    if (target < 0 || target >= next.length) return;
    [next[childIdx], next[target]] = [next[target], next[childIdx]];
    onChange({ ...container, children: next });
  }

  function duplicateChild(childIdx: number) {
    const copy: C2ContainerChild = {
      ...container.children[childIdx],
      id: uid(),
    } as C2ContainerChild;
    const next = [...container.children];
    next.splice(childIdx + 1, 0, copy);
    onChange({ ...container, children: next });
  }

  function deleteChild(childIdx: number) {
    onChange({
      ...container,
      children: container.children.filter((_, i) => i !== childIdx),
    });
  }

  function addChild(child: C2ContainerChild) {
    onChange({ ...container, children: [...container.children, child] });
  }

  return (
    <div className="rounded-lg border border-[#3f4147] bg-[#2b2d31] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e1f22]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleCollapse}
            className="text-gray-400 hover:text-white"
            title={container.collapsed ? "Expand" : "Collapse"}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                !container.collapsed && "rotate-90"
              )}
            />
          </button>
          <span className="text-sm font-semibold text-white">Container</span>
        </div>
        <div className="flex items-center gap-1">
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
            <ChevronUp className="h-4 w-4" />
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
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-red-400 hover:bg-[#3f4147]"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!container.collapsed && (
        <div className="p-3 space-y-3">
          {/* Spoiler */}
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={container.spoiler}
              onChange={(e) =>
                onChange({ ...container, spoiler: e.target.checked })
              }
              className="accent-[#5865F2]"
            />
            Mark as spoiler
          </label>

          {/* Sidebar color */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">Sidebar Color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={container.accentColor ?? "#5865F2"}
                onChange={(e) =>
                  onChange({ ...container, accentColor: e.target.value })
                }
                className="sr-only"
                id={`color-${container.id}`}
              />
              <label
                htmlFor={`color-${container.id}`}
                className="cursor-pointer flex items-center gap-2 rounded border border-[#3f4147] bg-[#1e1f22] px-3 py-1.5 text-sm text-gray-300 hover:bg-[#3f4147]"
              >
                Click to Set
                {container.accentColor && (
                  <span
                    className="h-4 w-4 rounded-sm border border-[#3f4147] inline-block flex-shrink-0"
                    style={{ backgroundColor: container.accentColor }}
                  />
                )}
              </label>
            </div>
          </div>

          {/* Children */}
          <div className="space-y-2">
            {container.children.map((child, childIdx) => (
              <ChildItemEditor
                key={child.id}
                child={child}
                index={childIdx}
                total={container.children.length}
                onChange={(updated) => updateChild(childIdx, updated)}
                onMoveUp={() => moveChild(childIdx, -1)}
                onMoveDown={() => moveChild(childIdx, 1)}
                onDuplicate={() => duplicateChild(childIdx)}
                onDelete={() => deleteChild(childIdx)}
                serverId={serverId}
              />
            ))}
          </div>

          <AddChildDropdown
            onAdd={addChild}
            sectionCount={container.children.filter((c) => c.type === "section").length}
          />
        </div>
      )}
    </div>
  );
}

// ── NonContainerTopLevelEditor ────────────────────────────────────────────────
// Renders editor body for top-level items that are not containers

interface NonContainerTopLevelEditorProps {
  item: Exclude<C2TopLevelItem, C2Container>;
  onChange: (updated: Exclude<C2TopLevelItem, C2Container>) => void;
  serverId?: string;
}

function NonContainerTopLevelEditor({
  item,
  onChange,
  serverId,
}: NonContainerTopLevelEditorProps) {
  if (item.type === "section") {
    return null; // handled upstream by TopLevelItemEditor
  }
  if (item.type === "text") {
    return (
      <TextChildEditor
        child={item}
        onChange={(updated) => onChange(updated)}
        onAddAccessory={(accessoryType) => {
          const section: C2Section = {
            id: item.id,
            type: "section",
            label: "Section",
            contents: [{ id: uid(), content: item.content }],
            accessory:
              accessoryType === "button"
                ? makeButton()
                : accessoryType === "link_button"
                ? makeLinkButton()
                : makeThumbnail(),
          };
          onChange(section);
        }}
      />
    );
  }
  if (item.type === "row") {
    return (
      <RowChildEditor
        child={item}
        onChange={(updated) => onChange(updated)}
        serverId={serverId}
      />
    );
  }
  if (item.type === "media_gallery") {
    return (
      <MediaGalleryChildEditor
        child={item}
        onChange={(updated) => onChange(updated)}
      />
    );
  }
  if (item.type === "file") {
    return (
      <FileChildEditor
        child={item}
        onChange={(updated) => onChange(updated)}
      />
    );
  }
  if (item.type === "separator") {
    return (
      <SeparatorChildEditor
        child={item}
        onChange={(updated) => onChange(updated)}
      />
    );
  }
  return null;
}

// ── TopLevelItemEditor ────────────────────────────────────────────────────────

interface TopLevelItemEditorProps {
  item: C2TopLevelItem;
  index: number;
  total: number;
  onChange: (updated: C2TopLevelItem) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  serverId?: string;
}

function TopLevelItemEditor({
  item,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  serverId,
}: TopLevelItemEditorProps) {
  if (item.type === "section") {
    return (
      <SectionEditor
        section={item}
        index={index}
        total={total}
        onChange={(updated) => onChange(updated)}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    );
  }

  if (item.type === "container") {
    return (
      <ContainerEditor
        container={item}
        index={index}
        total={total}
        onChange={(updated) => onChange(updated)}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        serverId={serverId}
      />
    );
  }

  return (
    <div className="rounded-lg border border-[#3f4147] bg-[#2b2d31] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e1f22]">
        <span className="text-sm font-semibold text-white">
          {topLevelTypeLabel(item.type)}
        </span>
        <div className="flex items-center gap-1">
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
            <ChevronUp className="h-4 w-4" />
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
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#3f4147]"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-red-400 hover:bg-[#3f4147]"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-3">
        <NonContainerTopLevelEditor
          item={item as Exclude<C2TopLevelItem, C2Container>}
          onChange={(updated) => onChange(updated)}
          serverId={serverId}
        />
      </div>
    </div>
  );
}

// ── AddTopLevelDropdown ───────────────────────────────────────────────────────

interface AddTopLevelDropdownProps {
  onAdd: (item: C2TopLevelItem) => void;
  sectionCount?: number;
}

function AddTopLevelDropdown({ onAdd, sectionCount = 0 }: AddTopLevelDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-sm text-gray-400 hover:text-white border border-dashed border-[#3f4147] w-full"
        >
          + Add Block ▾
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#2b2d31] border-[#3f4147] text-white">
        <DropdownMenuItem
          onClick={() => onAdd(makeContainer())}
          className="cursor-pointer"
        >
          Container
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAdd(makeText())}
          className="cursor-pointer"
        >
          Content
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAdd(makeRow())}
          className="cursor-pointer"
        >
          Row
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAdd(makeMediaGallery())}
          className="cursor-pointer"
        >
          Media Gallery
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAdd(makeFile())}
          className="cursor-pointer"
        >
          File
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAdd(makeSeparator())}
          className="cursor-pointer"
        >
          Separator
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAdd(makeSection(sectionCount + 1))}
          className="cursor-pointer"
        >
          Section
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── EditorPanel ───────────────────────────────────────────────────────────────

export interface EditorPanelProps {
  items: C2TopLevelItem[];
  onChange: (items: C2TopLevelItem[]) => void;
  serverId?: string;
}

export function EditorPanel({ items, onChange, serverId }: EditorPanelProps) {
  function updateItem(index: number, updated: C2TopLevelItem) {
    onChange(items.map((it, i) => (i === index ? updated : it)));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveDown(index: number) {
    if (index >= items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  function duplicate(index: number) {
    const copy: C2TopLevelItem = { ...items[index], id: uid() } as C2TopLevelItem;
    const next = [...items];
    next.splice(index + 1, 0, copy);
    onChange(next);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function append(item: C2TopLevelItem) {
    onChange([...items, item]);
  }

  return (
    <div>
      <div className="space-y-3 p-4">
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-500">
            <div className="text-3xl opacity-30">⬜</div>
            <p className="text-sm">No components yet</p>
            <p className="text-xs opacity-70">
              Use the button below to add your first block
            </p>
          </div>
        )}
        {items.map((item, idx) => (
          <TopLevelItemEditor
            key={item.id}
            item={item}
            index={idx}
            total={items.length}
            onChange={(updated) => updateItem(idx, updated)}
            onMoveUp={() => moveUp(idx)}
            onMoveDown={() => moveDown(idx)}
            onDuplicate={() => duplicate(idx)}
            onDelete={() => remove(idx)}
            serverId={serverId}
          />
        ))}
        <AddTopLevelDropdown
          onAdd={append}
          sectionCount={items.filter((i) => i.type === "section").length}
        />
      </div>
    </div>
  );
}
