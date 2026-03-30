"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Copy, Check, GripVertical } from "lucide-react";
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
import {
  makePage,
  makeComponent,
  type ModalPage,
  type ModalComponent,
  type ComponentType,
  type ModalSettings,
} from "@/components/modal-builder/discord-modal-builder";
import { generateElementKey } from "@/hooks/use-modal-elements";
import { useSyncModalElements } from "@/hooks/use-modal-elements";
import {
  useCreateModalTemplate,
  useUpdateModalTemplate,
} from "@/hooks/use-templates";

// Component type groups
const COMPONENT_GROUPS: { label: string; types: ComponentType[] }[] = [
  { label: "Text", types: ["short-answer", "paragraph"] },
  { label: "Choice", types: ["multiple-choice", "checkboxes", "dropdown"] },
  { label: "Select", types: ["user-select", "role-select", "channel-select", "user-role-select"] },
  { label: "Other", types: ["text-display", "file-upload", "single-checkbox"] },
];

const TYPE_LABELS: Record<ComponentType, string> = {
  "short-answer": "Short Answer",
  "paragraph": "Paragraph",
  "multiple-choice": "Multiple Choice",
  "checkboxes": "Checkboxes",
  dropdown: "Dropdown",
  "text-display": "Text Display",
  "file-upload": "File Upload",
  "single-checkbox": "Checkbox",
  "user-select": "User Select",
  "role-select": "Role Select",
  "channel-select": "Channel Select",
  "user-role-select": "User & Role Select",
};

// Input types that generate elements
const INPUT_TYPES: ComponentType[] = [
  "short-answer", "paragraph", "multiple-choice", "checkboxes", "dropdown",
  "file-upload", "single-checkbox", "user-select", "role-select", "channel-select", "user-role-select",
];

interface SimpleModalEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
  templateId?: string;
  initialName?: string;
  initialPages?: ModalPage[];
  initialSettings?: ModalSettings;
}

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

export function SimpleModalEditor({
  open,
  onOpenChange,
  serverId,
  templateId,
  initialName = "Untitled Modal",
  initialPages,
  initialSettings,
}: SimpleModalEditorProps) {
  const [name, setName] = useState(initialName);
  const [pages, setPages] = useState<ModalPage[]>(
    initialPages && initialPages.length > 0 ? initialPages : [makePage()]
  );
  const [settings] = useState<ModalSettings>(initialSettings ?? { outputLocations: [] });
  const [activePage, setActivePage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const createTemplate = useCreateModalTemplate(serverId);
  const updateTemplate = useUpdateModalTemplate(serverId, templateId ?? "");
  const syncModalElements = useSyncModalElements(serverId);

  const isSaving = createTemplate.isPending || updateTemplate.isPending || syncModalElements.isPending;

  const page = pages[activePage];
  const selectedComponent = page?.components.find((c) => c.id === selectedId);

  const handleSave = useCallback(async () => {
    const payload = { name, template_data: { pages, settings } };
    let savedId = templateId;

    try {
      if (templateId) {
        await updateTemplate.mutateAsync(payload);
      } else {
        const created = await createTemplate.mutateAsync(payload);
        savedId = created.id;
      }

      // Sync element registrations
      if (savedId) {
        const inputFields = pages.flatMap((p) =>
          p.components
            .filter((c) => INPUT_TYPES.includes(c.type))
            .map((c) => ({
              field_id: c.id,
              field_type: c.type,
              field_label: c.label || c.id,
              is_required: c.required ?? false,
            }))
        );
        await syncModalElements.mutateAsync({
          modal_template_id: savedId,
          modal_name: name,
          fields: inputFields,
        });
      }

      onOpenChange(false);
    } catch (err) {
      console.error("Failed to save modal:", err);
    }
  }, [name, pages, settings, templateId, createTemplate, updateTemplate, syncModalElements, onOpenChange]);

  const handleAddComponent = useCallback((type: ComponentType) => {
    if (!page || page.components.length >= 5) return;
    const comp = makeComponent(type);
    setPages((prev) =>
      prev.map((p, i) => (i === activePage ? { ...p, components: [...p.components, comp] } : p))
    );
    setSelectedId(comp.id);
  }, [page, activePage]);

  const handleDeleteComponent = useCallback((id: string) => {
    setPages((prev) =>
      prev.map((p, i) =>
        i === activePage ? { ...p, components: p.components.filter((c) => c.id !== id) } : p
      )
    );
    if (selectedId === id) setSelectedId(null);
  }, [activePage, selectedId]);

  const handleUpdateComponent = useCallback((id: string, patch: Partial<ModalComponent>) => {
    setPages((prev) =>
      prev.map((p, i) =>
        i === activePage
          ? { ...p, components: p.components.map((c) => (c.id === id ? { ...c, ...patch } : c)) }
          : p
      )
    );
  }, [activePage]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPages((prev) =>
        prev.map((p, i) => {
          if (i !== activePage) return p;
          const oldIndex = p.components.findIndex((c) => c.id === active.id);
          const newIndex = p.components.findIndex((c) => c.id === over.id);
          return { ...p, components: arrayMove(p.components, oldIndex, newIndex) };
        })
      );
    }
  }, [activePage]);

  const handleCopyKey = useCallback((key: string) => {
    navigator.clipboard.writeText(`{{element:${key}}}`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] border-[#313338] bg-[#232327] text-white overflow-hidden flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>{templateId ? "Edit Modal" : "Create Modal"}</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3f4147]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Modal name..."
            className="bg-transparent text-lg font-semibold text-[#F1F1F2] outline-none placeholder:text-[#8F8E8E] flex-1"
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left: Field list */}
          <div className="w-64 border-r border-[#3f4147] flex flex-col">
            <div className="px-3 py-2 border-b border-[#3f4147]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8F8E8E]">Fields</p>
              <p className="text-[10px] text-[#6D6F78]">{page?.components.length ?? 0}/5 components</p>
            </div>
            <ScrollArea className="flex-1 p-2">
              {page && page.components.length > 0 ? (
                <DndContext sensors={useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))} onDragEnd={handleDragEnd}>
                  <SortableContext items={page.components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1">
                      {page.components.map((comp) => {
                        const isInput = INPUT_TYPES.includes(comp.type);
                        const elementKey = isInput ? generateElementKey(name, comp.label) : null;
                        const isSelected = selectedId === comp.id;

                        return (
                          <SortableFieldRow
                            key={comp.id}
                            component={comp}
                            isSelected={isSelected}
                            elementKey={elementKey}
                            copiedKey={copiedKey}
                            onSelect={() => setSelectedId(comp.id)}
                            onDelete={() => handleDeleteComponent(comp.id)}
                            onCopyKey={handleCopyKey}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-6 text-[#8F8E8E] text-sm">
                  <p>No fields yet</p>
                  <p className="text-xs mt-1">Click a field type below to add</p>
                </div>
              )}
            </ScrollArea>

            {/* Add fields */}
            <div className="border-t border-[#3f4147] p-2">
              {COMPONENT_GROUPS.map((group) => (
                <div key={group.label} className="mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6D6F78] mb-1">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {group.types.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleAddComponent(type)}
                        disabled={page && page.components.length >= 5}
                        className="px-2 py-1 text-xs rounded border border-[#3f4147] bg-[#2F2F34] text-[#C7C6CB] hover:border-[#5865F2] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Field editor */}
          <div className="flex-1 flex flex-col min-h-0">
            {selectedComponent ? (
              <FieldEditor
                component={selectedComponent}
                modalName={name}
                onChange={(patch) => handleUpdateComponent(selectedComponent.id, patch)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#8F8E8E]">
                <div className="text-center">
                  <p className="text-sm">Select a field to edit</p>
                  <p className="text-xs mt-1 text-[#6D6F78]">
                    Or add fields from the panel on the left
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page tabs */}
        {pages.length > 1 && (
          <div className="border-t border-[#3f4147] px-4 py-2 flex gap-2">
            {pages.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePage(i)}
                className={cn(
                  "px-3 py-1 text-sm rounded transition-colors",
                  i === activePage
                    ? "bg-[#5865F2] text-white"
                    : "bg-[#2F2F34] text-[#C7C6CB] hover:bg-[#3f4147]"
                )}
              >
                Page {i + 1}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Sortable field row
interface SortableFieldRowProps {
  component: ModalComponent;
  isSelected: boolean;
  elementKey: string | null;
  copiedKey: string | null;
  onSelect: () => void;
  onDelete: () => void;
  onCopyKey: (key: string) => void;
}

function SortableFieldRow({
  component,
  isSelected,
  elementKey,
  copiedKey,
  onSelect,
  onDelete,
  onCopyKey,
}: SortableFieldRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors",
        isSelected ? "bg-[#5865F2]/20 border border-[#5865F2]/40" : "bg-[#2F2F34] hover:bg-[#3f4147] border border-transparent",
        isDragging && "opacity-50"
      )}
      onClick={onSelect}
    >
      <GripVertical className="h-3 w-3 text-[#6D6F78] cursor-grab flex-shrink-0" {...attributes} {...listeners} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#F1F1F2] truncate">{component.label || "Untitled Field"}</p>
        <p className="text-[10px] text-[#8F8E8E]">{TYPE_LABELS[component.type]}</p>
      </div>
      {elementKey && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCopyKey(elementKey);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#5865F2]/20 rounded"
          title="Copy element token"
        >
          {copiedKey === elementKey ? (
            <Check className="h-3 w-3 text-[#23A55A]" />
          ) : (
            <Copy className="h-3 w-3 text-[#8F8E8E]" />
          )}
        </button>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#f23f42]/20 rounded"
      >
        <Trash2 className="h-3 w-3 text-[#f23f42]" />
      </button>
    </div>
  );
}

// Field editor panel
interface FieldEditorProps {
  component: ModalComponent;
  modalName: string;
  onChange: (patch: Partial<ModalComponent>) => void;
}

function FieldEditor({ component, modalName, onChange }: FieldEditorProps) {
  const isInput = INPUT_TYPES.includes(component.type);
  const elementKey = isInput ? generateElementKey(modalName, component.label) : null;

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {/* Type */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8F8E8E] mb-1">Type</p>
          <p className="text-sm text-[#F1F1F2]">{TYPE_LABELS[component.type]}</p>
        </div>

        {/* Label */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#8F8E8E] mb-1 block">
            Label <span className="text-[#f23f42]">*</span>
          </label>
          <input
            value={component.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Field label..."
            className="w-full rounded border border-[#3f4147] bg-[#1e1f22] px-3 py-2 text-sm text-[#F1F1F2] outline-none focus:border-[#5865F2]"
          />
        </div>

        {/* Placeholder */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#8F8E8E] mb-1 block">
            Placeholder
          </label>
          <input
            value={component.placeholder}
            onChange={(e) => onChange({ placeholder: e.target.value })}
            placeholder="Optional placeholder..."
            className="w-full rounded border border-[#3f4147] bg-[#1e1f22] px-3 py-2 text-sm text-[#F1F1F2] outline-none focus:border-[#5865F2]"
          />
        </div>

        {/* Required toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#F1F1F2]">Required</span>
          <button
            type="button"
            role="switch"
            aria-checked={component.required}
            onClick={() => onChange({ required: !component.required })}
            className={cn(
              "relative h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none",
              component.required ? "bg-[#5865F2]" : "bg-[#3f4147]"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                component.required ? "translate-x-4" : "translate-x-0.5"
              )}
            />
          </button>
        </div>

        {/* Element key output */}
        {elementKey && (
          <div className="rounded border border-[#3f4147] bg-[#1e1f22] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8F8E8E] mb-1">
              Element Token
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-[#5865F2] truncate">
                {`{{element:${elementKey}}}`}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`{{element:${elementKey}}}`);
                }}
                className="text-[#8F8E8E] hover:text-[#F1F1F2] transition-colors"
                title="Copy token"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-[#6D6F78] mt-1">
              Use this token to reference this field&apos;s value in messages and templates.
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}