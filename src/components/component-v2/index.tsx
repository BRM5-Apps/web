"use client";

import { useState, useRef, useEffect } from "react";
import { EditorPanel } from "./editor-panel";
import { PreviewPanel } from "./preview-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { C2TopLevelItem } from "./types";

export interface ComponentV2BuilderV2Props {
  onSave?: (name: string, items: C2TopLevelItem[]) => void;
  isSaving?: boolean;
  submitRef?: React.MutableRefObject<(() => void) | null>;
  factionId?: string;
}

export function ComponentV2BuilderV2({
  onSave,
  isSaving: _isSaving,
  submitRef,
  factionId,
}: ComponentV2BuilderV2Props) {
  const [items, setItems] = useState<C2TopLevelItem[]>([]);
  const [name, setName] = useState("");

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const nameRef = useRef(name);
  nameRef.current = name;
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!submitRef) return;
    submitRef.current = () => onSaveRef.current?.(nameRef.current, itemsRef.current);
    return () => {
      submitRef.current = null;
    };
  }, [submitRef]);

  return (
    <div className="space-y-4">
      {/* Template name */}
      <div className="flex items-center gap-3">
        <Label htmlFor="cv2-template-name" className="shrink-0 text-sm text-muted-foreground">
          Template Name
        </Label>
        <Input
          id="cv2-template-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Welcome Message"
          className="max-w-xs"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Editor */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Components</h2>
          </div>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <EditorPanel items={items} onChange={setItems} factionId={factionId} />
          </div>
        </div>

        {/* Right: Preview */}
        <div>
          <div className="mb-2">
            <h2 className="text-sm font-semibold text-foreground">Preview</h2>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <PreviewPanel items={items} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-export types for consumers
export type {
  C2TopLevelItem,
  C2Container,
  C2Text,
  C2Row,
  C2MediaGallery,
  C2File,
  C2Separator,
  C2Button,
  C2LinkButton,
  C2SelectMenu,
  C2RowComponent,
  SelectOption,
  FlowAction,
  C2Section,
  C2SectionContent,
  C2Thumbnail,
  C2Accessory,
} from "./types";
