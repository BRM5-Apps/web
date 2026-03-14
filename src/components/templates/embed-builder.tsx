"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { useForm, FormProvider, useFormContext, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmbedPreview } from "@/components/discord-preview/embed-preview";
import { type DiscordTheme } from "@/components/discord-preview/discord-theme";
import { JsonImportDialog } from "@/components/templates/json-import";
import { FieldEditor } from "@/components/templates/field-editor";
import { Plus, Trash2, GripVertical, Variable, Upload, Download, Save, Sun, Moon } from "lucide-react";
import type { EmbedTemplate } from "@/types/template";

// ── Variables ──
const AVAILABLE_VARIABLES = [
  { key: "{{username}}", description: "The user's Discord username" },
  { key: "{{user_id}}", description: "The user's Discord ID" },
  { key: "{{rank}}", description: "The user's rank name" },
  { key: "{{unit}}", description: "The user's unit" },
  { key: "{{event_name}}", description: "Current event name" },
  { key: "{{timestamp}}", description: "Current timestamp" },
  { key: "{{faction_name}}", description: "Name of the faction" },
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
}

export function EmbedBuilder({ template, isSaving, onSave }: EmbedBuilderProps) {
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

  const values = form.watch();

  return (
    <FormProvider {...form}>
      <div className="grid gap-6 lg:grid-cols-[400px_1fr] xl:grid-cols-[420px_1fr]">
        {/* Left: Form */}
        <Card className="p-4">
          <div className="space-y-5">
            <Section title="Template">
              <TextField name="name" label="Template Name" placeholder="Welcome Message" />
              <div className="flex items-center justify-between pt-1">
                <Label htmlFor="isDefault" className="text-sm text-muted-foreground">Default</Label>
                <Switch id="isDefault" checked={values.isDefault} onCheckedChange={(v) => form.setValue("isDefault", v)} />
              </div>
            </Section>

            <Separator />

            <Section title="Author">
              <TextField name="authorName" label="Name" placeholder="Faction Bot" withVariables />
              <TextField name="authorIconUrl" label="Icon URL" placeholder="https://..." />
              <TextField name="authorUrl" label="URL" placeholder="https://..." />
            </Section>

            <Separator />

            <Section title="Title">
              <TextField name="title" label="Text" placeholder="Operation Briefing" withVariables />
              <TextField name="url" label="URL" placeholder="https://..." />
            </Section>

            <Separator />

            <Section title="Description">
              <TextAreaField name="description" label="Content" placeholder="Write description..." rows={5} withVariables />
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

            <Section title="Media">
              <TextField name="imageUrl" label="Image URL" placeholder="https://..." />
              <TextField name="thumbnailUrl" label="Thumbnail URL" placeholder="https://..." />
            </Section>

            <Separator />

            <Section title="Footer">
              <TextField name="footerText" label="Text" placeholder="© Faction" withVariables />
              <TextField name="footerIconUrl" label="Icon URL" placeholder="https://..." />
              <div className="flex items-center justify-between pt-1">
                <Label htmlFor="timestamp" className="text-sm text-muted-foreground">Include timestamp</Label>
                <Switch id="timestamp" checked={values.timestamp} onCheckedChange={(v) => form.setValue("timestamp", v)} />
              </div>
            </Section>

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
        <div className="rounded-md border p-4">
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
          <div className="flex items-start gap-6">
            <div className="hidden h-10 w-10 shrink-0 rounded-full bg-[#34363c] sm:block" />
            <div className="min-w-0 flex-1">
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
          } catch (e) {
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

function fromAnyJson(data: unknown): EmbedFormData {
  // Try to interpret common embed shapes
  const asTpl = data as Partial<EmbedTemplate> & { embeds?: any[] };
  if (asTpl.embeds && Array.isArray(asTpl.embeds) && asTpl.embeds.length > 0) {
    // Discord message with embeds array
    const e = asTpl.embeds[0] ?? {};
    return normalizeFromDiscord(e);
  }
  if (typeof asTpl === "object" && asTpl) {
    return {
      name: (asTpl as any).name ?? "Imported Embed",
      title: (asTpl as any).title ?? "",
      url: "",
      description: (asTpl as any).description ?? "",
      color: (asTpl as any).color ?? "#4f545c",
      fields: (asTpl as any).fields ?? [],
      imageUrl: (asTpl as any).imageUrl ?? "",
      thumbnailUrl: (asTpl as any).thumbnailUrl ?? "",
      footerText: (asTpl as any).footer ?? "",
      footerIconUrl: "",
      authorName: (asTpl as any).authorName ?? "",
      authorIconUrl: (asTpl as any).authorIconUrl ?? "",
      authorUrl: "",
      timestamp: false,
      isDefault: Boolean((asTpl as any).isDefault ?? false),
    };
  }
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

function normalizeFromDiscord(e: any): EmbedFormData {
  return {
    name: "Imported Embed",
    title: e.title ?? "",
    url: e.url ?? "",
    description: e.description ?? "",
    color: typeof e.color === "number" ? `#${e.color.toString(16).padStart(6, "0")}` : e.color ?? "#4f545c",
    fields: Array.isArray(e.fields)
      ? e.fields.map((f: any) => ({ name: f.name ?? "", value: f.value ?? "", inline: Boolean(f.inline) }))
      : [],
    imageUrl: e.image?.url ?? "",
    thumbnailUrl: e.thumbnail?.url ?? "",
    footerText: e.footer?.text ?? "",
    footerIconUrl: e.footer?.icon_url ?? "",
    authorName: e.author?.name ?? "",
    authorIconUrl: e.author?.icon_url ?? "",
    authorUrl: e.author?.url ?? "",
    timestamp: Boolean(e.timestamp),
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium text-muted-foreground">{title}</div>
      <div className="space-y-3">{children}</div>
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

