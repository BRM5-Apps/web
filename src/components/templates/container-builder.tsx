"use client";

import { useRef, useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MessagePreview } from "@/components/discord-preview/message-preview";
import { type DiscordContainerComponent } from "@/components/discord-preview/container-preview";
import { type DiscordButtonStyle } from "@/components/discord-preview/button-preview";
import { type DiscordTheme } from "@/components/discord-preview/discord-theme";
import { JsonImportDialog } from "@/components/templates/json-import";
import type { ContainerTemplate } from "@/types/template";
import { cn } from "@/lib/utils";
import { Plus, Rows, Square, Text, Image, Minus, Save, Upload, Download, Sun, Moon } from "lucide-react";

type ActionItem =
  | { type: "button"; label: string; style: DiscordButtonStyle; emoji?: string; disabled?: boolean }
  | { type: "select"; placeholder?: string; disabled?: boolean };

type ContainerItem = DiscordContainerComponent;

const containerSchema = z.object({
  name: z.string().min(1, "Required"),
  accentColor: z.string().optional().default(""),
});

export interface ContainerBuilderProps {
  template?: Partial<ContainerTemplate> | null;
  onSave?: (data: { name: string; accentColor?: string; components: ContainerItem[] }) => void;
  isSaving?: boolean;
  /** Optional ref — parent can call submitRef.current?.() to trigger save */
  submitRef?: React.MutableRefObject<(() => void) | null>;
  /** Bot name for the preview header */
  webhookUsername?: string;
  /** Bot avatar URL for the preview header */
  webhookAvatarUrl?: string;
}

export function ContainerBuilder({ template, onSave, isSaving, submitRef, webhookUsername, webhookAvatarUrl }: ContainerBuilderProps) {
  const form = useForm<{ name: string; accentColor?: string }>({
    resolver: zodResolver(containerSchema),
    defaultValues: { name: template?.name ?? "", accentColor: (template?.template_data as any)?.accentColor ?? "" },
  });

  const [components, setComponents] = useState<ContainerItem[]>(() => (Array.isArray(template?.template_data?.components) ? (template!.template_data!.components as DiscordContainerComponent[]) : []));

  // Expose imperative save handle for parent toolbars
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const componentsRef = useRef(components);
  componentsRef.current = components;
  useEffect(() => {
    if (!submitRef) return;
    submitRef.current = () => {
      onSaveRef.current?.({
        name: form.getValues("name") ?? "",
        accentColor: form.getValues("accentColor") || undefined,
        components: componentsRef.current,
      });
    };
    return () => { submitRef.current = null; };
  }, [submitRef, form]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [discordTheme, setDiscordTheme] = useState<DiscordTheme>("dark");

  function addActionRow() {
    setComponents((prev) => [...prev, { type: "action_row", components: [] }]);
  }
  function addText() {
    setComponents((prev) => [...prev, { type: "text_display", content: "New text" }]);
  }
  function addSection() {
    setComponents((prev) => [...prev, { type: "section", text: "Section content" }]);
  }
  function addSeparator() {
    setComponents((prev) => [...prev, { type: "separator" }]);
  }
  function addMediaGallery() {
    setComponents((prev) => [...prev, { type: "media_gallery", items: [{ url: "https://placehold.co/600x400" }] }]);
  }
  function addButtonToRow(rowIndex: number) {
    setComponents((prev) =>
      prev.map((c, i) => (i === rowIndex && c.type === "action_row" ? { ...c, components: [...c.components, { type: "button", label: "Button", style: "primary" }] } : c))
    );
  }
  function addSelectToRow(rowIndex: number) {
    setComponents((prev) =>
      prev.map((c, i) => (i === rowIndex && c.type === "action_row" ? { ...c, components: [...c.components, { type: "select", placeholder: "Choose..." }] } : c))
    );
  }

  function updateComponent(index: number, next: ContainerItem) {
    setComponents((prev) => prev.map((c, i) => (i === index ? next : c)));
  }
  function removeComponent(index: number) {
    setComponents((prev) => prev.filter((_, i) => i !== index));
    setSelectedIndex(null);
  }
  function moveComponent(index: number, dir: -1 | 1) {
    setComponents((prev) => {
      const next = [...prev];
      const ni = index + dir;
      if (ni < 0 || ni >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(ni, 0, item);
      return next;
    });
  }

  function toJson() {
    return JSON.stringify({ name: form.getValues("name"), accentColor: form.getValues("accentColor"), components }, null, 2);
  }

  function fromJson(json: string) {
    const data = JSON.parse(json);
    form.setValue("name", data.name ?? template?.name ?? "");
    form.setValue("accentColor", data.accentColor ?? (template?.template_data as any)?.accentColor ?? "");
    if (Array.isArray(data.components)) setComponents(data.components);
  }

  return (
    <div className="grid gap-6 2xl:grid-cols-[240px_1fr_360px_400px] xl:grid-cols-[220px_1fr_320px] lg:grid-cols-[1fr]">
      {/* Palette */}
      <Card className="p-3">
        <div className="mb-2 text-sm font-medium text-muted-foreground">Component Palette</div>
        <div className="grid gap-2">
          <Button variant="outline" size="sm" onClick={addActionRow}><Rows className="mr-2 h-4 w-4" /> Action Row</Button>
          <Button variant="outline" size="sm" onClick={addText}><Text className="mr-2 h-4 w-4" /> Text Display</Button>
          <Button variant="outline" size="sm" onClick={addSection}><Square className="mr-2 h-4 w-4" /> Section</Button>
          <Button variant="outline" size="sm" onClick={addMediaGallery}><Image className="mr-2 h-4 w-4" /> Media Gallery</Button>
          <Button variant="outline" size="sm" onClick={addSeparator}><Minus className="mr-2 h-4 w-4" /> Separator</Button>
        </div>
        <Separator className="my-3" />
        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="name">Template Name</Label>
            <Input id="name" value={form.watch("name") ?? ""} onChange={(e) => form.setValue("name", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="accentColor">Accent Color</Label>
            <Input id="accentColor" value={form.watch("accentColor") ?? ""} onChange={(e) => form.setValue("accentColor", e.target.value)} placeholder="#5865F2" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setJsonOpen(true)}><Upload className="mr-2 h-4 w-4" /> Import JSON</Button>
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(toJson()).catch(() => {})}><Download className="mr-2 h-4 w-4" /> Export JSON</Button>
          </div>
          <Button className="w-full" onClick={() => onSave?.({ name: form.getValues("name") ?? "", accentColor: form.getValues("accentColor") || undefined, components })} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> Save Template
          </Button>
        </div>
      </Card>

      {/* Canvas */}
      <Card className="p-4">
        <div className="mb-2 text-sm font-medium text-muted-foreground">Canvas</div>
        {components.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">Add components from the palette to start building.</div>
        ) : (
          <div className="space-y-3">
            {components.map((c, i) => (
              <div key={i} className={cn("rounded-md border p-3", selectedIndex === i && "ring-2 ring-primary")} onClick={() => setSelectedIndex(i)}>
                <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {c.type === "action_row" ? "Action Row" : c.type === "text_display" ? "Text" : c.type === "section" ? "Section" : c.type === "media_gallery" ? "Media Gallery" : "Separator"}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); moveComponent(i, -1); }} disabled={i === 0}>Up</Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); moveComponent(i, 1); }} disabled={i === components.length - 1}>Down</Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeComponent(i); }} aria-label="Remove">✕</Button>
                  </div>
                </div>
                {c.type === "action_row" ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {c.components.map((ac, ai) => (
                        <span key={ai} className="rounded-md border bg-muted px-2 py-1 text-xs">
                          {ac.type === "button" ? `Button: ${ac.label}` : `Select: ${ac.placeholder ?? "Select"}`}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => addButtonToRow(i)}>+ Button</Button>
                      <Button size="sm" variant="outline" onClick={() => addSelectToRow(i)}>+ Select</Button>
                    </div>
                  </div>
                ) : c.type === "text_display" ? (
                  <div className="text-sm">{c.content}</div>
                ) : c.type === "section" ? (
                  <div className="text-sm">{c.text}</div>
                ) : c.type === "media_gallery" ? (
                  <div className="grid grid-cols-2 gap-2">
                    {c.items.map((it, ii) => (
                      <img key={ii} src={it.url} alt="" className="h-20 w-full rounded-md object-cover" />
                    ))}
                  </div>
                ) : (
                  <div className="h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Config Panel */}
      <Card className="p-4">
        <div className="mb-2 text-sm font-medium text-muted-foreground">Config</div>
        {selectedIndex == null ? (
          <div className="text-sm text-muted-foreground">Select a node on the canvas to configure.</div>
        ) : (
          <NodeConfig node={components[selectedIndex]} onChange={(n) => updateComponent(selectedIndex, n)} />
        )}
      </Card>

      {/* Live Preview */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">Live Preview</div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDiscordTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            aria-label="Toggle Discord theme"
          >
            {discordTheme === "dark" ? (
              <><Sun className="mr-1.5 h-4 w-4" /> Light</>
            ) : (
              <><Moon className="mr-1.5 h-4 w-4" /> Dark</>
            )}
          </Button>
        </div>
        <MessagePreview
          botName={webhookUsername || "BRM5 Bot"}
          botAvatarUrl={webhookAvatarUrl}
          container={{ components }}
          discordTheme={discordTheme}
        />
      </Card>

      <JsonImportDialog
        open={jsonOpen}
        onOpenChange={setJsonOpen}
        onImport={fromJson}
        getJson={toJson}
        title="Import/Export Container JSON"
      />
    </div>
  );
}

function NodeConfig({ node, onChange }: { node: ContainerItem; onChange: (n: ContainerItem) => void }) {
  if (node.type === "text_display") {
    return (
      <div className="space-y-2">
        <Label htmlFor="text">Text</Label>
        <textarea id="text" className="min-h-[120px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none" value={node.content} onChange={(e) => onChange({ ...node, content: e.target.value })} />
      </div>
    );
  }
  if (node.type === "section") {
    return (
      <div className="space-y-2">
        <Label htmlFor="sect">Section Text</Label>
        <textarea id="sect" className="min-h-[120px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none" value={node.text} onChange={(e) => onChange({ ...node, text: e.target.value })} />
      </div>
    );
  }
  if (node.type === "media_gallery") {
    return (
      <div className="space-y-2">
        <Label className="text-sm">Images</Label>
        <div className="space-y-2">
          {node.items.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={it.url} onChange={(e) => onChange({ ...node, items: node.items.map((x, xi) => (xi === i ? { url: e.target.value } : x)) })} placeholder="https://..." />
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => onChange({ ...node, items: [...node.items, { url: "https://placehold.co/400x300" }] })}><Plus className="mr-2 h-4 w-4" /> Add image</Button>
      </div>
    );
  }
  if (node.type === "action_row") {
    return (
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Buttons and selects in this row:</div>
        {node.components.map((c, i) => (
          <div key={i} className="rounded-md border p-2">
            {c.type === "button" ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label>Label</Label>
                  <Input value={c.label} onChange={(e) => onChange({ ...node, components: node.components.map((x, xi) => (xi === i ? { ...c, label: e.target.value } : x)) })} />
                </div>
                <div>
                  <Label>Style</Label>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none"
                    value={c.style}
                    onChange={(e) => onChange({ ...node, components: node.components.map((x, xi) => (xi === i ? { ...c, style: e.target.value as DiscordButtonStyle } : x)) })}
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="success">Success</option>
                    <option value="danger">Danger</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <Label>Placeholder</Label>
                <Input value={c.placeholder ?? ""} onChange={(e) => onChange({ ...node, components: node.components.map((x, xi) => (xi === i ? { ...c, placeholder: e.target.value } : x)) })} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  return <div className="text-sm text-muted-foreground">No configuration for this component.</div>;
}

