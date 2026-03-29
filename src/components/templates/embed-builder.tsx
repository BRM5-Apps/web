"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { z } from "zod";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmbedPreview } from "@/components/discord-preview/embed-preview";
import { type DiscordTheme } from "@/components/discord-preview/discord-theme";
import { JsonImportDialog } from "@/components/templates/json-import";
import { FieldEditor } from "@/components/templates/field-editor";
import { cn } from "@/lib/utils";
import { Plus, Variable, Upload, Download, Save, Sun, Moon, ChevronRight } from "lucide-react";
import type { EmbedTemplate } from "@/types/template";

// ── Variables ──
const AVAILABLE_VARIABLES = [
  { key: "{{username}}", description: "The user's Discord username" },
  { key: "{{user_id}}", description: "The user's Discord ID" },
  { key: "{{rank}}", description: "The user's rank name" },
  { key: "{{unit}}", description: "The user's unit" },
  { key: "{{event_name}}", description: "Current event name" },
  { key: "{{timestamp}}", description: "Current timestamp" },
  { key: "{{server_name}}", description: "Name of the server" },
] as const;

// ── Zod Schema ──
const embedFieldSchema = z.object({
  name: z.string().min(1, "Required"),
  value: z.string().min(1, "Required"),
  inline: z.boolean().optional().default(false),
});

const embedSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().optional().default(""),
  url: z.string().url().optional().or(z.literal("")),
  description: z.string().optional().default(""),
  color: z.string().regex(/^#?[0-9a-fA-F]{6}$/).optional().or(z.literal("")),
  fields: z.array(embedFieldSchema).optional().default([]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  footerText: z.string().optional().default(""),
  footerIconUrl: z.string().url().optional().or(z.literal("")),
  authorName: z.string().optional().default(""),
  authorIconUrl: z.string().url().optional().or(z.literal("")),
  authorUrl: z.string().url().optional().or(z.literal("")),
  timestamp: z.boolean().optional().default(false),
  isDefault: z.boolean().optional().default(false),
});

export type EmbedFormData = z.infer<typeof embedSchema>;

export interface EmbedBuilderProps {
  template?: Partial<EmbedTemplate> | null;
  isSaving?: boolean;
  onSave?: (data: EmbedFormData) => void;
  onDataChange?: (data: EmbedFormData) => void;
  /** Optional ref — parent can call submitRef.current?.() to trigger form submission */
  submitRef?: React.MutableRefObject<(() => void) | null>;
  webhookUsername?: string;
  webhookAvatarUrl?: string;
  sidebar?: React.ReactNode;
}

export function EmbedBuilder({ template, isSaving, onSave, onDataChange, submitRef, webhookUsername, webhookAvatarUrl, sidebar }: EmbedBuilderProps) {
  const defaultValues = useMemo<EmbedFormData>(() => ({
    name: template?.name ?? "",
    title: template?.title ?? "",
    url: "",
    description: template?.description ?? "",
    color: template?.color ?? "#4f545c",
    fields: (template?.fields ?? []).map((f) => ({ ...f, inline: f.inline ?? false })),
    imageUrl: template?.imageUrl ?? "",
    thumbnailUrl: template?.thumbnailUrl ?? "",
    footerText: template?.footer ?? "",
    footerIconUrl: "",
    authorName: template?.authorName ?? "",
    authorIconUrl: template?.authorIconUrl ?? "",
    authorUrl: "",
    timestamp: false,
    isDefault: false,
  }), [template]);

  const form = useForm<EmbedFormData>({ resolver: zodResolver(embedSchema), defaultValues, mode: "onBlur" });
  const [jsonOpen, setJsonOpen] = useState(false);
  const [discordTheme, setDiscordTheme] = useState<DiscordTheme>("dark");
  const [sideView, setSideView] = useState<"preview" | "elements">("preview");

  const values = form.watch();

  // Expose an imperative submit handle so parent toolbars can trigger save
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  useEffect(() => {
    if (!submitRef) return;
    submitRef.current = () => form.handleSubmit((d) => onSaveRef.current?.(d))();
    return () => { submitRef.current = null; };
  }, [submitRef, form]);

  // Use a ref to track the previous values object so we only call onDataChange
  // when content actually changes — not just when form.watch() returns a new reference.
  const prevValuesRef = useRef(values);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const prev = prevValuesRef.current;
    const next = values;
    // Shallow compare all primitive fields; deep compare fields array
    const hasChanged =
      next.name !== prev.name ||
      next.title !== prev.title ||
      next.description !== prev.description ||
      next.color !== prev.color ||
      next.timestamp !== prev.timestamp ||
      next.isDefault !== prev.isDefault ||
      next.imageUrl !== prev.imageUrl ||
      next.thumbnailUrl !== prev.thumbnailUrl ||
      next.footerText !== prev.footerText ||
      next.authorName !== prev.authorName ||
      next.authorIconUrl !== prev.authorIconUrl ||
      next.authorUrl !== prev.authorUrl ||
      JSON.stringify(next.fields) !== JSON.stringify(prev.fields);
    if (hasChanged) {
      prevValuesRef.current = next;
      onDataChange?.(next);
    }
  });

  return (
    <FormProvider {...form}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          {/* Left: Form */}
          <Card className="p-4">
            <div className="space-y-5">
            {/* ── Template name — prominent ── */}
            <div className="rounded-md border border-primary/40 bg-primary/5 px-3 py-3">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-primary">
                Template Name <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5 flex items-center gap-2">
                <Input
                  id="name"
                  value={form.watch("name") ?? ""}
                  onChange={(e) => form.setValue("name", e.target.value)}
                  placeholder="e.g. Welcome Message"
                  className="border-primary/30 focus-visible:ring-primary"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Your template will be saved under this name.</p>
              <div className="mt-2 flex items-center justify-between">
                <Label htmlFor="isDefault" className="text-xs text-muted-foreground">Set as default</Label>
                <Switch id="isDefault" checked={values.isDefault} onCheckedChange={(v) => form.setValue("isDefault", v)} />
              </div>
            </div>

            <Separator />

            <Section title="Author">
              <TextField name="authorName" label="Name" placeholder="Server Bot" />
              <TextField name="authorIconUrl" label="Icon URL" placeholder="https://..." />
              <TextField name="authorUrl" label="URL" placeholder="https://..." />
            </Section>

            <Separator />

            <Section title="Title">
              <TextField name="title" label="Text" placeholder="Operation Briefing" />
              <TextField name="url" label="URL" placeholder="https://..." />
            </Section>

            <Separator />

            <Section title="Description">
              <TextAreaField name="description" label="Content" placeholder="Write description..." rows={5} />
              <TextField name="color" label="Color" placeholder="#5865F2" />
            </Section>

            <Separator />

            <Section title="Fields">
              <FieldEditor
                name="fields"
                addLabel="Add field"
                newItem={() => ({ name: "", value: "", inline: false })}
                renderItem={({ index }) => <FieldItem index={index} />}
              />
            </Section>

            <Separator />

            <Section title="Images">
              <TextField name="imageUrl" label="Large Image URL" placeholder="https://..." />
              <TextField name="thumbnailUrl" label="Thumbnail URL" placeholder="https://..." />
            </Section>

            <Separator />

            <Section title="Footer">
              <TextField name="footerText" label="Text" placeholder="© Server" />
              <TextField name="footerIconUrl" label="Icon URL" placeholder="https://..." />
              <div className="flex items-center justify-between pt-1">
                <Label htmlFor="timestamp" className="text-sm text-muted-foreground">Include timestamp</Label>
                <Switch id="timestamp" checked={values.timestamp} onCheckedChange={(v) => form.setValue("timestamp", v)} />
              </div>
            </Section>

            <Separator />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#2b2d31] border-[#3f4147] text-white">
                <DropdownMenuItem
                  onClick={() => {}}
                  className="cursor-pointer text-sm"
                >
                  Add Embed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {}}
                  className="cursor-pointer text-sm"
                >
                  Add Row
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setJsonOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" /> Import JSON
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(toApiPayload(values), null, 2))}>
                  <Download className="mr-2 h-4 w-4" /> Export JSON
                </Button>
                <div className="ml-auto" />
                <Button type="button" size="sm" onClick={form.handleSubmit((d) => onSave?.(d))} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" /> Save Template
                </Button>
              </div>
            </div>
          </Card>

          {/* Right: Live Preview */}
          <div className="h-fit rounded-md border p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">
                {sideView === "preview" ? "Live Preview" : "Elements"}
              </div>
              <div className="flex items-center gap-2">
                {sidebar ? (
                  <div className="rounded-md border border-border p-1">
                    {(["preview", "elements"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSideView(value)}
                        className={cn(
                          "rounded px-3 py-1.5 text-sm capitalize transition-colors",
                          sideView === value
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                ) : null}
                {sideView === "preview" ? (
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
                ) : null}
              </div>
            </div>
            {sideView === "elements" && sidebar ? (
              <div>{sidebar}</div>
            ) : (
            <div className="flex items-start gap-3">
            {/* Bot avatar */}
            {webhookAvatarUrl ? (
              <img
                src={webhookAvatarUrl}
                alt=""
                className="hidden h-10 w-10 shrink-0 rounded-full object-cover sm:block"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white sm:flex"
                style={{ backgroundColor: "#5865F2" }}
              >
                {webhookUsername ? webhookUsername[0].toUpperCase() : "B"}
              </div>
            )}
              <div className="min-w-0 flex-1">
              {/* Bot header row */}
              <div className="mb-1.5 flex items-baseline gap-2">
                <span className="text-sm font-semibold" style={{ color: discordTheme === "dark" ? "#f2f3f5" : "#060607" }}>
                  {webhookUsername || "BRM5 Bot"}
                </span>
                <span
                  className="inline-flex items-center rounded px-1 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: "#5865F2", color: "#fff" }}
                >
                  BOT
                </span>
                <span className="text-xs" style={{ color: discordTheme === "dark" ? "#949ba4" : "#5c5e66" }}>
                  Today at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
                <EmbedPreview
                  title={values.title}
                  url={values.url || undefined}
                  description={values.description}
                  color={values.color}
                  fields={values.fields}
                  footer={{ text: values.footerText, iconUrl: values.footerIconUrl || undefined }}
                  image={values.imageUrl ? { url: values.imageUrl } : undefined}
                  thumbnail={values.thumbnailUrl ? { url: values.thumbnailUrl } : undefined}
                  author={values.authorName ? { name: values.authorName, iconUrl: values.authorIconUrl || undefined, url: values.authorUrl || undefined } : undefined}
                  timestamp={values.timestamp ? new Date() : undefined}
                  discordTheme={discordTheme}
                />
              </div>
            </div>
            )}
          </div>
      </div>

      <JsonImportDialog
        open={jsonOpen}
        onOpenChange={setJsonOpen}
        onImport={(json) => {
          try {
            const data = JSON.parse(json);
            // Accept both our template shape and raw Discord embed
            const next = fromAnyJson(data);
            form.reset(next);
            setJsonOpen(false);
          } catch (_e) {
            // handled inside dialog as well
          }
        }}
        getJson={() => JSON.stringify(toApiPayload(values), null, 2)}
        title="Import/Export Embed JSON"
      />
    </FormProvider>
  );
}

// ── Helpers ──
function toApiPayload(values: EmbedFormData) {
  // Convert form values to an API-ready embed structure
  return {
    name: values.name,
    title: values.title || undefined,
    description: values.description || undefined,
    color: values.color || undefined,
    fields: values.fields?.length ? values.fields : undefined,
    footer: values.footerText || undefined,
    imageUrl: values.imageUrl || undefined,
    thumbnailUrl: values.thumbnailUrl || undefined,
    authorName: values.authorName || undefined,
    authorIconUrl: values.authorIconUrl || undefined,
    isDefault: values.isDefault || undefined,
  } as Partial<EmbedTemplate> & { name: string };
}

interface RawEmbed {
  title?: unknown;
  description?: unknown;
  color?: unknown;
  url?: unknown;
  name?: unknown;
  fields?: Array<{ name?: unknown; value?: unknown; inline?: unknown }>;
  imageUrl?: unknown;
  thumbnailUrl?: unknown;
  footer?: unknown;
  authorName?: unknown;
  authorIconUrl?: unknown;
  isDefault?: unknown;
  author?: { name?: unknown; url?: unknown; icon_url?: unknown };
  image?: { url?: unknown };
  thumbnail?: { url?: unknown };
  embeds?: Array<unknown>;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function fromAnyJson(data: unknown): EmbedFormData {
  // Try to interpret common embed shapes
  if (typeof data !== "object" || data === null) {
    return {
      name: "Imported Embed",
      title: "",
      url: "",
      description: "",
      color: "#4f545c",
      fields: [],
      imageUrl: "",
      thumbnailUrl: "",
      footerText: "",
      footerIconUrl: "",
      authorName: "",
      authorIconUrl: "",
      authorUrl: "",
      timestamp: false,
      isDefault: false,
    };
  }
  const asTpl = data as RawEmbed;
  if (Array.isArray(asTpl.embeds) && asTpl.embeds.length > 0) {
    // Discord message with embeds array
    return normalizeFromDiscord(asTpl.embeds[0] ?? {});
  }
  return {
    name: str(asTpl.name) || "Imported Embed",
    title: str(asTpl.title),
    url: "",
    description: str(asTpl.description),
    color: str(asTpl.color) || "#4f545c",
    fields: Array.isArray(asTpl.fields)
      ? asTpl.fields.map((f) => ({
          name: str(f.name),
          value: str(f.value),
          inline: Boolean(f.inline),
        }))
      : [],
    imageUrl: str(asTpl.imageUrl),
    thumbnailUrl: str(asTpl.thumbnailUrl),
    footerText: str(asTpl.footer),
    footerIconUrl: "",
    authorName: str(asTpl.authorName),
    authorIconUrl: str(asTpl.authorIconUrl),
    authorUrl: "",
    timestamp: false,
    isDefault: Boolean(asTpl.isDefault ?? false),
  };
}

function normalizeFromDiscord(e: unknown): EmbedFormData {
  const raw = (typeof e === "object" && e !== null ? e : {}) as RawEmbed;
  const colorRaw = raw.color;
  const color =
    typeof colorRaw === "number"
      ? `#${colorRaw.toString(16).padStart(6, "0")}`
      : str(colorRaw) || "#4f545c";
  const footer = (typeof raw.footer === "object" && raw.footer !== null ? raw.footer : {}) as {
    text?: unknown;
    icon_url?: unknown;
  };
  return {
    name: "Imported Embed",
    title: str(raw.title),
    url: str(raw.url),
    description: str(raw.description),
    color,
    fields: Array.isArray(raw.fields)
      ? raw.fields.map((f) => ({ name: str(f.name), value: str(f.value), inline: Boolean(f.inline) }))
      : [],
    imageUrl: typeof raw.image === "object" && raw.image !== null ? str(raw.image.url) : "",
    thumbnailUrl: typeof raw.thumbnail === "object" && raw.thumbnail !== null ? str(raw.thumbnail.url) : "",
    footerText: str(footer.text),
    footerIconUrl: str(footer.icon_url),
    authorName: typeof raw.author === "object" && raw.author !== null ? str(raw.author.name) : "",
    authorIconUrl: typeof raw.author === "object" && raw.author !== null ? str(raw.author.icon_url) : "",
    authorUrl: typeof raw.author === "object" && raw.author !== null ? str(raw.author.url) : "",
    timestamp: false,
    isDefault: false,
  };
}

// ── Form Field Components ──

interface BaseFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  withVariables?: boolean;
}

function TextField({ name, label, placeholder, withVariables }: BaseFieldProps) {
  const form = useFormContext<EmbedFormData>();
  const value = form.watch(name as any) as string;
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input id={name} value={value ?? ""} onChange={(e) => form.setValue(name as any, e.target.value)} placeholder={placeholder} />
        {withVariables && <VariablePicker onInsert={(v) => form.setValue(name as any, (form.getValues(name as any) ?? "") + v)} />}
      </div>
    </div>
  );
}

function TextAreaField({ name, label, placeholder, withVariables, rows = 4 }: BaseFieldProps & { rows?: number }) {
  const form = useFormContext<EmbedFormData>();
  const value = form.watch(name as any) as string;
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex items-start gap-2">
        <textarea
          id={name}
          rows={rows}
          className="min-h-[100px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none"
          value={value ?? ""}
          onChange={(e) => form.setValue(name as any, e.target.value)}
          placeholder={placeholder}
        />
        {withVariables && <VariablePicker onInsert={(v) => form.setValue(name as any, (form.getValues(name as any) ?? "") + v)} />}
      </div>
    </div>
  );
}

function Section({ title, children }: {
  title: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setCollapsed((c) => !c)}
      >
        <ChevronRight
          width={14}
          height={14}
          style={{ transform: collapsed ? "rotate(0deg)" : "rotate(90deg)", transition: "transform 0.15s ease" }}
        />
        {title}
      </button>
      {!collapsed && children}
    </div>
  );
}

function VariablePicker({ onInsert }: { onInsert: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label="Insert variable">
          <Variable className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="border-b p-2 text-sm font-medium">Insert variable</div>
        <ScrollArea className="h-56">
          <div className="p-2">
            {AVAILABLE_VARIABLES.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => {
                  onInsert(v.key);
                  setOpen(false);
                }}
                className="w-full rounded-md p-2 text-left hover:bg-accent"
              >
                <div className="font-mono text-sm">{v.key}</div>
                <div className="text-xs text-muted-foreground">{v.description}</div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function FieldItem({ index }: { index: number }) {
  const { getValues, setValue } = useFormContext<EmbedFormData>();
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="space-y-1">
        <Label htmlFor={`fields.${index}.name`}>Name</Label>
        <div className="flex items-center gap-2">
          <Input id={`fields.${index}.name`} value={getValues(`fields.${index}.name`) ?? ""} onChange={(e) => setValue(`fields.${index}.name`, e.target.value)} placeholder="Field name" />
          <VariablePicker onInsert={(v) => setValue(`fields.${index}.name`, (getValues(`fields.${index}.name`) ?? "") + v)} />
        </div>
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label htmlFor={`fields.${index}.value`}>Value</Label>
        <div className="flex items-start gap-2">
          <textarea
            id={`fields.${index}.value`}
            rows={3}
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none"
            value={getValues(`fields.${index}.value`) ?? ""}
            onChange={(e) => setValue(`fields.${index}.value`, e.target.value)}
            placeholder="Field value"
          />
          <VariablePicker onInsert={(v) => setValue(`fields.${index}.value`, (getValues(`fields.${index}.value`) ?? "") + v)} />
        </div>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <Switch id={`fields.${index}.inline`} checked={Boolean(getValues(`fields.${index}.inline`))} onCheckedChange={(v) => setValue(`fields.${index}.inline`, v)} />
        <Label htmlFor={`fields.${index}.inline`} className="text-sm text-muted-foreground">Display inline</Label>
      </div>
    </div>
  );
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (_e) {
    // ignore
  }
}

