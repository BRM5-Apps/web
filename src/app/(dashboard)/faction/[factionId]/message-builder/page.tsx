"use client";

import { useParams } from "next/navigation";
import { useMemo, useRef, useState, type ComponentType } from "react";
import { EmbedBuilder, type EmbedFormData } from "@/components/templates/embed-builder";
import { ComponentV2BuilderV2 } from "@/components/component-v2";
import type { C2TopLevelItem } from "@/components/component-v2";
import { ElementInsertionProvider } from "@/components/elements/element-insertion-provider";
import { ElementSidebar } from "@/components/elements/element-sidebar";
import {
  useCreateEmbedTemplate,
  useCreateContainerTemplate,
  useCreateTextTemplate,
  useEmbedTemplates,
  useContainerTemplates,
  useTextTemplates,
  useDeleteEmbedTemplate,
  useDeleteContainerTemplate,
  useDeleteTextTemplate,
  useUpdateEmbedTemplate,
  useUpdateContainerTemplate,
  useUpdateTextTemplate,
} from "@/hooks/use-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  Send,
  MessageSquare,
  FileImage,
  LayoutTemplate,
  BookOpen,
  Copy,
  Upload,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSendMessage, useMessageHistory } from "@/hooks/use-messages";
import type { EmbedTemplate, ContainerTemplate, TextTemplate } from "@/types/template";

type MessageMode = "text" | "embed" | "component";
type TemplateKind = "text" | "embed" | "container";

const MODES: {
  value: MessageMode;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { value: "text", label: "Text", icon: MessageSquare },
  { value: "embed", label: "Embed", icon: FileImage },
  { value: "component", label: "Component V2", icon: LayoutTemplate },
];

const EMPTY_EMBED_DRAFT: EmbedFormData = {
  name: "",
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

function toTemplateKind(mode: MessageMode): TemplateKind {
  return mode === "component" ? "container" : mode;
}

function toEmbedDraft(template?: Partial<EmbedTemplate> | null): EmbedFormData {
  return {
    name: template?.name ?? "",
    title: template?.title ?? "",
    url: "",
    description: template?.description ?? "",
    color: template?.color ?? "#4f545c",
    fields: (template?.fields ?? []).map((field) => ({ ...field, inline: field.inline ?? false })),
    imageUrl: template?.imageUrl ?? "",
    thumbnailUrl: template?.thumbnailUrl ?? "",
    footerText: template?.footer ?? "",
    footerIconUrl: "",
    authorName: template?.authorName ?? "",
    authorIconUrl: template?.authorIconUrl ?? "",
    authorUrl: "",
    timestamp: false,
    isDefault: false,
  };
}

function snapshotText(content: string): string {
  return JSON.stringify({ content });
}

function snapshotEmbed(draft?: EmbedFormData | null): string {
  const normalized = draft ?? EMPTY_EMBED_DRAFT;
  return JSON.stringify({
    title: normalized.title,
    url: normalized.url,
    description: normalized.description,
    color: normalized.color,
    fields: normalized.fields,
    imageUrl: normalized.imageUrl,
    thumbnailUrl: normalized.thumbnailUrl,
    footerText: normalized.footerText,
    footerIconUrl: normalized.footerIconUrl,
    authorName: normalized.authorName,
    authorIconUrl: normalized.authorIconUrl,
    authorUrl: normalized.authorUrl,
    timestamp: normalized.timestamp,
    isDefault: normalized.isDefault,
  });
}

function snapshotComponent(items: C2TopLevelItem[]): string {
  return JSON.stringify(items);
}

function currentSnapshotForMode(
  mode: MessageMode,
  textContent: string,
  embedDraft: EmbedFormData | null,
  componentDraft: C2TopLevelItem[]
): string {
  if (mode === "text") return snapshotText(textContent);
  if (mode === "embed") return snapshotEmbed(embedDraft);
  return snapshotComponent(componentDraft);
}

function autoNameForMode(mode: MessageMode): string {
  const label = mode === "component" ? "Component" : mode === "embed" ? "Embed" : "Message";
  return `${label} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function TemplateRow({
  name,
  onLoad,
  onCopy,
  onDelete,
  isDeleting,
}: {
  name: string;
  onLoad: () => void;
  onCopy: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
      <span className="flex-1 truncate text-sm font-medium">{name}</span>
      <div className="flex shrink-0 items-center gap-1">
        <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={onLoad} title="Load into builder">
          <Upload className="h-3 w-3" />
          Load
        </Button>
        <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={onCopy} title="Duplicate">
          <Copy className="h-3 w-3" />
          Copy
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 px-2 text-xs text-destructive hover:text-destructive"
          onClick={onDelete}
          disabled={isDeleting}
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function MessagesSheet({
  open,
  onOpenChange,
  mode,
  serverId,
  templateName,
  onTemplateNameChange,
  onSave,
  onSaveAsNew,
  isSaving,
  onLoadText,
  onLoadEmbed,
  onLoadComponent,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: MessageMode;
  serverId: string;
  templateName: string;
  onTemplateNameChange: (v: string) => void;
  onSave: () => void;
  onSaveAsNew: () => void;
  isSaving: boolean;
  onLoadText: (t: TextTemplate) => void;
  onLoadEmbed: (t: EmbedTemplate) => void;
  onLoadComponent: (t: ContainerTemplate) => void;
}) {
  const texts = useTextTemplates(serverId);
  const embeds = useEmbedTemplates(serverId);
  const containers = useContainerTemplates(serverId);

  const deleteText = useDeleteTextTemplate(serverId);
  const deleteEmbed = useDeleteEmbedTemplate(serverId);
  const deleteContainer = useDeleteContainerTemplate(serverId);

  const createText = useCreateTextTemplate(serverId);
  const createEmbed = useCreateEmbedTemplate(serverId);
  const createContainer = useCreateContainerTemplate(serverId);

  const isLoading =
    mode === "text" ? texts.isLoading :
    mode === "embed" ? embeds.isLoading :
    containers.isLoading;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-[380px] flex-col gap-0 p-0 sm:w-[420px]">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle>Messages</SheetTitle>
        </SheetHeader>

        <div className="space-y-3 border-b border-border px-5 py-4">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Save current {mode === "component" ? "component" : mode} message
          </Label>
          <Input
            placeholder="Template name..."
            value={templateName}
            onChange={(e) => onTemplateNameChange(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={onSave} disabled={isSaving || !templateName.trim()} size="sm" className="flex-1">
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button onClick={onSaveAsNew} disabled={isSaving || !templateName.trim()} size="sm" variant="outline">
              Save as new
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Saved {mode} messages
          </p>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : mode === "text" && texts.data?.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">No saved text messages yet.</p>
          ) : mode === "embed" && embeds.data?.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">No saved embed messages yet.</p>
          ) : mode === "component" && containers.data?.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">No saved component messages yet.</p>
          ) : null}

          {mode === "text" && texts.data?.map((template) => (
            <TemplateRow
              key={template.id}
              name={template.name}
              isDeleting={deleteText.isPending}
              onLoad={() => { onLoadText(template); onOpenChange(false); }}
              onCopy={() => createText.mutate({ name: `${template.name} (copy)`, content: template.content })}
              onDelete={() => deleteText.mutate(template.id)}
            />
          ))}

          {mode === "embed" && embeds.data?.map((template) => (
            <TemplateRow
              key={template.id}
              name={template.name}
              isDeleting={deleteEmbed.isPending}
              onLoad={() => { onLoadEmbed(template); onOpenChange(false); }}
              onCopy={() => createEmbed.mutate({
                name: `${template.name} (copy)`,
                title: template.title,
                description: template.description,
                color: template.color,
                fields: template.fields,
                footer: template.footer,
                imageUrl: template.imageUrl,
                thumbnailUrl: template.thumbnailUrl,
                authorName: template.authorName,
                authorIconUrl: template.authorIconUrl,
              })}
              onDelete={() => deleteEmbed.mutate(template.id)}
            />
          ))}

          {mode === "component" && containers.data?.map((template) => (
            <TemplateRow
              key={template.id}
              name={template.name}
              isDeleting={deleteContainer.isPending}
              onLoad={() => { onLoadComponent(template); onOpenChange(false); }}
              onCopy={() => createContainer.mutate({
                name: `${template.name} (copy)`,
                template_data: template.template_data,
              })}
              onDelete={() => deleteContainer.mutate(template.id)}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function MessageBuilderPage() {
  const params = useParams<{ serverId: string }>();
  const serverId = params.serverId;

  const [mode, setMode] = useState<MessageMode>("text");
  const [sendVia, setSendVia] = useState<"bot" | "webhook">("bot");
  const [channelId, setChannelId] = useState("");
  const [webhookUrls, setWebhookUrls] = useState<string[]>([""]);
  const [webhookUsername, setWebhookUsername] = useState("");
  const [webhookAvatarUrl, setWebhookAvatarUrl] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const [builderKey, setBuilderKey] = useState(0);
  const [textContent, setTextContent] = useState("");
  const [loadedEmbed, setLoadedEmbed] = useState<Partial<EmbedTemplate> | null>(null);
  const [loadedItems, setLoadedItems] = useState<C2TopLevelItem[]>([]);
  const [embedDraft, setEmbedDraft] = useState<EmbedFormData | null>(null);
  const [componentDraft, setComponentDraft] = useState<C2TopLevelItem[]>([]);
  const [textSideView, setTextSideView] = useState<"preview" | "elements">("preview");

  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [currentTemplateType, setCurrentTemplateType] = useState<TemplateKind | null>(null);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(null);

  const pendingSendRef = useRef(false);
  const pendingDestRef = useRef<{ channel_id?: string; webhook_urls?: string[]; webhook_username?: string; webhook_avatar_url?: string }>({});

  const sendMessage = useSendMessage(serverId);
  const messageHistory = useMessageHistory(serverId);
  const [hasSentThisSession, setHasSentThisSession] = useState(false);
  const lastSend = hasSentThisSession ? messageHistory.data?.[0] : null;

  const createEmbed = useCreateEmbedTemplate(serverId);
  const createContainer = useCreateContainerTemplate(serverId);
  const createText = useCreateTextTemplate(serverId);
  const updateEmbed = useUpdateEmbedTemplate(serverId, currentTemplateType === "embed" ? currentTemplateId ?? "" : "");
  const updateContainer = useUpdateContainerTemplate(serverId, currentTemplateType === "container" ? currentTemplateId ?? "" : "");
  const updateText = useUpdateTextTemplate(serverId, currentTemplateType === "text" ? currentTemplateId ?? "" : "");

  const isSaving =
    createEmbed.isPending ||
    createContainer.isPending ||
    createText.isPending ||
    updateEmbed.isPending ||
    updateContainer.isPending ||
    updateText.isPending;

  const currentModeTemplateType = toTemplateKind(mode);
  const currentSnapshot = useMemo(
    () => currentSnapshotForMode(mode, textContent, embedDraft, componentDraft),
    [mode, textContent, embedDraft, componentDraft]
  );
  const hasMatchingSavedTemplate =
    currentTemplateId !== null &&
    currentTemplateType === currentModeTemplateType &&
    lastSavedSnapshot !== null;
  const isDirty = !hasMatchingSavedTemplate || currentSnapshot !== lastSavedSnapshot;

  function finalizeSave(id: string, type: TemplateKind, name: string, snapshot: string) {
    setCurrentTemplateId(id);
    setCurrentTemplateType(type);
    setLastSavedSnapshot(snapshot);
    setTemplateName(name);
    if (pendingSendRef.current) {
      pendingSendRef.current = false;
      setHasSentThisSession(true);
      sendMessage.mutate({ ...pendingDestRef.current, template_type: type, template_id: id });
    }
  }

  function clearPendingSend() {
    pendingSendRef.current = false;
    pendingDestRef.current = {};
  }

  function persistText(options?: { requireName?: boolean; forceCreate?: boolean }) {
    const requireName = options?.requireName ?? true;
    const forceCreate = options?.forceCreate ?? false;
    const name = templateName.trim() || (!requireName ? autoNameForMode(mode) : "");
    if (!name) {
      toast.error("Enter a name before saving");
      clearPendingSend();
      return;
    }
    if (!textContent.trim()) {
      toast.error("Message cannot be empty");
      clearPendingSend();
      return;
    }

    const payload = { name, content: textContent };
    const snapshot = snapshotText(textContent);
    const shouldUpdate = !forceCreate && currentTemplateId && currentTemplateType === "text";
    const mutation = shouldUpdate ? updateText : createText;

    mutation.mutate(payload, {
      onSuccess: (saved) => finalizeSave(saved.id, "text", name, snapshot),
      onError: () => clearPendingSend(),
    });
  }

  function persistEmbed(data: EmbedFormData, options?: { requireName?: boolean; forceCreate?: boolean }) {
    const requireName = options?.requireName ?? true;
    const forceCreate = options?.forceCreate ?? false;
    const name = templateName.trim() || data.name.trim() || (!requireName ? autoNameForMode(mode) : "");
    if (!name) {
      toast.error("Enter a name before saving");
      clearPendingSend();
      return;
    }

    const payload = {
      name,
      title: data.title || undefined,
      description: data.description || undefined,
      color: data.color || undefined,
      fields: data.fields?.length ? data.fields : undefined,
      footer: data.footerText || undefined,
      imageUrl: data.imageUrl || undefined,
      thumbnailUrl: data.thumbnailUrl || undefined,
      authorName: data.authorName || undefined,
      authorIconUrl: data.authorIconUrl || undefined,
    };
    const snapshot = snapshotEmbed(data);
    const shouldUpdate = !forceCreate && currentTemplateId && currentTemplateType === "embed";
    const mutation = shouldUpdate ? updateEmbed : createEmbed;

    mutation.mutate(payload, {
      onSuccess: (saved) => finalizeSave(saved.id, "embed", name, snapshot),
      onError: () => clearPendingSend(),
    });
  }

  function persistComponent(items: C2TopLevelItem[], options?: { requireName?: boolean; forceCreate?: boolean }) {
    const requireName = options?.requireName ?? true;
    const forceCreate = options?.forceCreate ?? false;
    const name = templateName.trim() || (!requireName ? autoNameForMode(mode) : "");
    if (!name) {
      toast.error("Enter a name before saving");
      clearPendingSend();
      return;
    }

    const payload = {
      name,
      template_data: { components: items },
    };
    const snapshot = snapshotComponent(items);
    const shouldUpdate = !forceCreate && currentTemplateId && currentTemplateType === "container";
    const mutation = shouldUpdate ? updateContainer : createContainer;

    mutation.mutate(payload, {
      onSuccess: (saved) => finalizeSave(saved.id, "container", name, snapshot),
      onError: () => clearPendingSend(),
    });
  }

  function handleSave(options?: { requireName?: boolean; forceCreate?: boolean }) {
    if (mode === "text") {
      persistText(options);
      return;
    }
    if (mode === "embed") {
      persistEmbed(embedDraft ?? toEmbedDraft(loadedEmbed), options);
      return;
    }
    persistComponent(componentDraft, options);
  }

  function loadText(template: TextTemplate) {
    setMode("text");
    setTemplateName(template.name);
    setTextContent(template.content);
    setCurrentTemplateId(template.id);
    setCurrentTemplateType("text");
    setLastSavedSnapshot(snapshotText(template.content));
    setBuilderKey((value) => value + 1);
    toast.success(`Loaded "${template.name}"`);
  }

  function loadEmbed(template: EmbedTemplate) {
    const draft = toEmbedDraft(template);
    setMode("embed");
    setTemplateName(template.name);
    setLoadedEmbed(template);
    setEmbedDraft(draft);
    setCurrentTemplateId(template.id);
    setCurrentTemplateType("embed");
    setLastSavedSnapshot(snapshotEmbed(draft));
    setBuilderKey((value) => value + 1);
    toast.success(`Loaded "${template.name}"`);
  }

  function loadComponent(template: ContainerTemplate) {
    const items = (template.template_data?.components as C2TopLevelItem[]) ?? [];
    setMode("component");
    setTemplateName(template.name);
    setLoadedItems(items);
    setComponentDraft(items);
    setCurrentTemplateId(template.id);
    setCurrentTemplateType("container");
    setLastSavedSnapshot(snapshotComponent(items));
    setBuilderKey((value) => value + 1);
    toast.success(`Loaded "${template.name}"`);
  }

  function handleSend() {
    if (sendVia === "bot" && !channelId.trim()) {
      toast.error("Enter a channel ID");
      return;
    }

    const validWebhookUrls = webhookUrls.map((url) => url.trim()).filter(Boolean);
    if (sendVia === "webhook" && validWebhookUrls.length === 0) {
      toast.error("Enter at least one webhook URL");
      return;
    }

    const destination = sendVia === "webhook"
      ? {
          webhook_urls: validWebhookUrls,
          ...(webhookUsername.trim() ? { webhook_username: webhookUsername.trim() } : {}),
          ...(webhookAvatarUrl.trim() ? { webhook_avatar_url: webhookAvatarUrl.trim() } : {}),
        }
      : { channel_id: channelId.trim() };

    if (!isDirty && currentTemplateId && currentTemplateType === currentModeTemplateType) {
      setHasSentThisSession(true);
      sendMessage.mutate({ ...destination, template_type: currentModeTemplateType, template_id: currentTemplateId });
      return;
    }

    pendingSendRef.current = true;
    pendingDestRef.current = destination;
    handleSave({ requireName: false });
  }

  function handleModeChange(nextMode: MessageMode) {
    setMode(nextMode);
    setCurrentTemplateId(null);
    setCurrentTemplateType(null);
    setLastSavedSnapshot(null);
    setTemplateName("");
  }

  return (
    <ElementInsertionProvider>
      <div className="mx-auto max-w-[1000px] space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Message Builder</h1>
          <p className="text-muted-foreground">
            Compose and send messages to your Discord server.
          </p>
        </div>

        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Message Type
              </p>
              <div className="flex overflow-hidden rounded-lg border border-border">
                {MODES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleModeChange(value)}
                    className={cn(
                      "flex items-center gap-1.5 border-r border-border px-3 py-2 text-sm font-medium transition-colors last:border-r-0",
                      mode === value
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Send Via
              </p>
              <div className="flex overflow-hidden rounded-lg border border-border">
                {(["bot", "webhook"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSendVia(value)}
                    className={cn(
                      "border-r border-border px-3 py-2 text-sm font-medium capitalize transition-colors last:border-r-0",
                      sendVia === value
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="ml-auto space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setSheetOpen(true)} variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Messages
                </Button>
                <Button variant="outline" onClick={() => handleSave()} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : currentTemplateId && currentTemplateType === currentModeTemplateType ? "Save" : "Save as new"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSend}
                  disabled={
                    (sendVia === "bot" ? !channelId.trim() : !webhookUrls.some((url) => url.trim())) ||
                    sendMessage.isPending ||
                    isSaving
                  }
                >
                  {sendMessage.isPending || (pendingSendRef.current && isSaving) ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {sendMessage.isPending ? "Sending..." : isSaving ? "Saving..." : "Send"}
                </Button>
                {lastSend ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {lastSend.status === "sent" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    ) : null}
                    {lastSend.status === "pending" ? (
                      <Clock className="h-3.5 w-3.5 text-yellow-500" />
                    ) : null}
                    {lastSend.status === "failed" ? (
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                    ) : null}
                    <span className="capitalize">{lastSend.status}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          {sendVia === "bot" ? (
            <div className="space-y-1.5">
              <Label htmlFor="channelId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Target Channel ID
              </Label>
              <Input
                id="channelId"
                placeholder="123456789012345678"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Webhook URLs
                </Label>
                <div className="space-y-2">
                  {webhookUrls.map((url, index) => (
                    <div key={index} className="flex gap-1.5">
                      <Input
                        placeholder="https://discord.com/api/webhooks/..."
                        value={url}
                        onChange={(e) => {
                          const next = [...webhookUrls];
                          next[index] = e.target.value;
                          setWebhookUrls(next);
                        }}
                      />
                      {webhookUrls.length > 1 ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-10 w-10 shrink-0 text-destructive hover:text-destructive"
                          onClick={() => setWebhookUrls(webhookUrls.filter((_, i) => i !== index))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-xs"
                    onClick={() => setWebhookUrls([...webhookUrls, ""])}
                  >
                    <Plus className="h-3 w-3" />
                    Add URL
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Username (optional)
                  </Label>
                  <Input
                    placeholder="Override bot name"
                    value={webhookUsername}
                    onChange={(e) => setWebhookUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Avatar URL (optional)
                  </Label>
                  <Input
                    placeholder="https://..."
                    value={webhookAvatarUrl}
                    onChange={(e) => setWebhookAvatarUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        {mode === "text" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="space-y-3 p-4">
              <div className="space-y-1">
                <Label htmlFor="textContent">Message Content</Label>
                <p className="text-xs text-muted-foreground">
                  Save updates the loaded template. Save as new creates a copy.
                </p>
              </div>
              <textarea
                id="textContent"
                key={builderKey}
                rows={12}
                className="min-h-[360px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={"Type your message...\n\nVariables: {{element:userName}}, {{element:memberCount}}"}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </Card>

            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {textSideView === "preview" ? "Preview" : "Elements"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {textSideView === "preview"
                      ? "Tokens stay visible until they are resolved at send/runtime."
                      : "Insert server mentions and element tokens into the active field."}
                  </p>
                </div>
                <div className="rounded-md border border-border p-1">
                  {(["preview", "elements"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTextSideView(value)}
                      className={cn(
                        "rounded px-3 py-1.5 text-sm capitalize transition-colors",
                        textSideView === value
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              {textSideView === "preview" ? (
                <div className="rounded-lg border border-border bg-[#313338] p-4 text-sm text-[#f2f3f5]">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5865F2] text-sm font-bold text-white">
                      {webhookUsername ? webhookUsername[0]?.toUpperCase() : "B"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{webhookUsername || "BRM5 Bot"}</span>
                        <span className="rounded bg-[#5865F2] px-1 text-[10px] font-semibold uppercase text-white">
                          BOT
                        </span>
                      </div>
                      <p className="text-xs text-[#949ba4]">
                        Today at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="min-h-[320px] whitespace-pre-wrap break-words rounded-md bg-black/10 p-3">
                    {textContent || <span className="text-[#949ba4]">Nothing to preview yet.</span>}
                  </div>
                </div>
              ) : (
                <ElementSidebar serverId={serverId} className="w-full border-0 bg-transparent shadow-none" />
              )}
            </Card>
          </div>
        ) : null}

        {mode === "embed" ? (
          <EmbedBuilder
            key={builderKey}
            template={loadedEmbed}
            onSave={(data) => persistEmbed(data)}
            onDataChange={setEmbedDraft}
            isSaving={createEmbed.isPending || updateEmbed.isPending}
            webhookUsername={sendVia === "webhook" ? webhookUsername : undefined}
            webhookAvatarUrl={sendVia === "webhook" ? webhookAvatarUrl : undefined}
            sidebar={<ElementSidebar serverId={serverId} />}
          />
        ) : null}

        {mode === "component" ? (
          <ComponentV2BuilderV2
            key={builderKey}
            initialItems={loadedItems}
            onSave={(items) => persistComponent(items)}
            onItemsChange={setComponentDraft}
            isSaving={createContainer.isPending || updateContainer.isPending}
            serverId={serverId}
            webhookUsername={sendVia === "webhook" ? webhookUsername : undefined}
            webhookAvatarUrl={sendVia === "webhook" ? webhookAvatarUrl : undefined}
            sidebar={<ElementSidebar serverId={serverId} />}
          />
        ) : null}

        <MessagesSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          mode={mode}
          serverId={serverId}
          templateName={templateName}
          onTemplateNameChange={setTemplateName}
          onSave={() => handleSave()}
          onSaveAsNew={() => handleSave({ forceCreate: true })}
          isSaving={isSaving}
          onLoadText={loadText}
          onLoadEmbed={loadEmbed}
          onLoadComponent={loadComponent}
        />
      </div>
    </ElementInsertionProvider>
  );
}
