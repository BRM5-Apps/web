"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Copy, Check, Play, RotateCcw } from "lucide-react";
import { EditorPanel } from "./editor-panel";
import { PreviewPanel } from "./preview-panel";
import { toDiscordJSON, fromDiscordJSON } from "./discord-json-converter";
import type { C2TopLevelItem } from "./types";

export interface ComponentV2BuilderV2Props {
  onSave?: (items: C2TopLevelItem[]) => void;
  onItemsChange?: (items: C2TopLevelItem[]) => void;
  isSaving?: boolean;
  submitRef?: React.MutableRefObject<(() => void) | null>;
  serverId?: string;
  initialItems?: C2TopLevelItem[];
  webhookUsername?: string;
  webhookAvatarUrl?: string;
  sidebar?: React.ReactNode;
}

export function ComponentV2BuilderV2({
  onSave,
  onItemsChange,
  isSaving: _isSaving,
  submitRef,
  serverId,
  initialItems,
  webhookUsername,
  webhookAvatarUrl,
  sidebar,
}: ComponentV2BuilderV2Props) {
  const [items, setItems] = useState<C2TopLevelItem[]>(initialItems ?? []);
  const [jsonExpanded, setJsonExpanded] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sideView, setSideView] = useState<"preview" | "elements">("preview");

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!submitRef) return;
    submitRef.current = () => onSaveRef.current?.(itemsRef.current);
    return () => { submitRef.current = null; };
  }, [submitRef]);

  useEffect(() => {
    onItemsChange?.(items);
  }, [items, onItemsChange]);

  // Sync items -> jsonText when not manually edited
  useEffect(() => {
    if (!isDirty) {
      setJsonText(JSON.stringify(toDiscordJSON(items), null, 2));
    }
  }, [items, isDirty]);

  const handleJsonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
    setIsDirty(true);
    setParseError(null);
  }, []);

  const handleApply = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      const newItems = fromDiscordJSON(parsed);
      setItems(newItems);
      setIsDirty(false);
      setParseError(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [jsonText]);

  const handleReset = useCallback(() => {
    setJsonText(JSON.stringify(toDiscordJSON(items), null, 2));
    setIsDirty(false);
    setParseError(null);
  }, [items]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = jsonText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [jsonText]);

  return (
    <div className="space-y-4 flex flex-col min-h-0">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          {/* Left: Editor */}
          <div className="flex flex-col self-start">
            <div className="mb-1.5 h-6 flex items-center shrink-0">
              <h2 className="text-sm font-semibold text-foreground">Components</h2>
            </div>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <EditorPanel items={items} onChange={setItems} serverId={serverId} />
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col self-start">
            <div className="mb-1.5 h-6 flex items-center justify-between gap-3 shrink-0">
              <h2 className="text-sm font-semibold text-foreground">
                {sideView === "preview" ? "Preview" : "Elements"}
              </h2>
              {sidebar ? (
                <div className="rounded-md border border-border p-1">
                  {(["preview", "elements"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSideView(value)}
                      className={`rounded px-3 py-1.5 text-sm capitalize transition-colors ${
                        sideView === value
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              {sideView === "elements" && sidebar ? (
                <div className="h-full [&>*]:!w-full [&>*]:!border-0 [&>*]:!bg-transparent [&>*]:!shadow-none">
                  {sidebar}
                </div>
              ) : (
                <PreviewPanel items={items} webhookUsername={webhookUsername} webhookAvatarUrl={webhookAvatarUrl} />
              )}
            </div>
          </div>
      </div>

      {/* JSON Editor */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="flex w-full items-center justify-between bg-card hover:bg-muted/50 transition-colors">
          <button
            type="button"
            className="flex flex-1 items-center gap-2 px-4 py-3 text-left"
            onClick={() => setJsonExpanded(!jsonExpanded)}
          >
            <span className="text-sm font-semibold text-foreground">JSON Editor</span>
            {isDirty && (
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
                Modified
              </span>
            )}
          </button>
          <div className="flex items-center gap-2 pr-3">
            {jsonExpanded && (
              <>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                {isDirty && (
                  <>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                      onClick={handleApply}
                    >
                      <Play className="h-3.5 w-3.5" />
                      Apply
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      onClick={handleReset}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </button>
                  </>
                )}
              </>
            )}
            <button
              type="button"
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setJsonExpanded(!jsonExpanded)}
              aria-label={jsonExpanded ? "Collapse JSON editor" : "Expand JSON editor"}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${jsonExpanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>

        {jsonExpanded && (
          <div className="border-t border-border bg-card p-4">
            <textarea
              className="w-full min-h-[320px] resize-y rounded-md border border-border bg-background p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={jsonText}
              onChange={handleJsonChange}
              placeholder="Paste Discord Component V2 JSON here..."
              spellCheck={false}
            />
            {parseError && (
              <p className="mt-2 text-sm text-destructive">{parseError}</p>
            )}
          </div>
        )}
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
  ActionGraphDocument,
  ActionGraphNode,
  ActionGraphEdge,
} from "./types";
