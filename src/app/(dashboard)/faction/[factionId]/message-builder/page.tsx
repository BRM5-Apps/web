"use client";

import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { EmbedBuilder, type EmbedFormData } from "@/components/templates/embed-builder";
import { ComponentV2BuilderV2 } from "@/components/component-v2";
import type { C2TopLevelItem } from "@/components/component-v2";
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
} from "@/hooks/use-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageMode = "text" | "embed" | "component";

const MODES: {
  value: MessageMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "text", label: "Text", icon: MessageSquare },
  { value: "embed", label: "Embed", icon: FileImage },
  { value: "component", label: "Component V2", icon: LayoutTemplate },
];

// ─── Template row ─────────────────────────────────────────────────────────────

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
    <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 bg-card">
      <span className="flex-1 truncate text-sm font-medium">{name}</span>
      <div className="flex items-center gap-1 shrink-0">
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={onLoad} title="Load into builder">
          <Upload className="h-3 w-3" />
          Load
        </Button>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={onCopy} title="Duplicate">
          <Copy className="h-3 w-3" />
          Copy
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
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

// ─── Messages Sheet ───────────────────────────────────────────────────────────

function MessagesSheet({
  open,
  onOpenChange,
  mode,
  factionId,
  templateName,
  onTemplateNameChange,
  onSave,
  isSaving,
  onLoadText,
  onLoadEmbed,
  onLoadComponent,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: MessageMode;
  factionId: string;
  templateName: string;
  onTemplateNameChange: (v: string) => void;
  onSave: () => void;
  isSaving: boolean;
  onLoadText: (t: TextTemplate) => void;
  onLoadEmbed: (t: EmbedTemplate) => void;
  onLoadComponent: (t: ContainerTemplate) => void;
}) {
  const texts = useTextTemplates(factionId);
  const embeds = useEmbedTemplates(factionId);
  const containers = useContainerTemplates(factionId);

  const deleteText = useDeleteTextTemplate(factionId);
  const deleteEmbed = useDeleteEmbedTemplate(factionId);
  const deleteContainer = useDeleteContainerTemplate(factionId);

  const createText = useCreateTextTemplate(factionId);
  const createEmbed = useCreateEmbedTemplate(factionId);
  const createContainer = useCreateContainerTemplate(factionId);

  const isLoading =
    mode === "text" ? texts.isLoading :
    mode === "embed" ? embeds.isLoading :
    containers.isLoading;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:w-[420px] flex flex-col gap-0 p-0">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle>Messages</SheetTitle>
        </SheetHeader>

        {/* Save row */}
        <div className="px-5 py-4 border-b border-border space-y-3">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Save current {mode === "component" ? "component" : mode} message
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="Template name…"
              value={templateName}
              onChange={(e) => onTemplateNameChange(e.target.value)}
              className="flex-1"
            />
            <Button onClick={onSave} disabled={isSaving || !templateName.trim()} size="sm">
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        {/* Saved list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">
            Saved {mode} messages
          </p>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : mode === "text" && texts.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No saved text messages yet.</p>
          ) : mode === "embed" && embeds.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No saved embed messages yet.</p>
          ) : mode === "component" && containers.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No saved component messages yet.</p>
          ) : null}

          {mode === "text" && texts.data?.map((t) => (
            <TemplateRow
              key={t.id}
              name={t.name}
              isDeleting={deleteText.isPending}
              onLoad={() => { onLoadText(t); onOpenChange(false); }}
              onCopy={() => createText.mutate({ name: `${t.name} (copy)`, content: t.content })}
              onDelete={() => deleteText.mutate(t.id)}
            />
          ))}

          {mode === "embed" && embeds.data?.map((t) => (
            <TemplateRow
              key={t.id}
              name={t.name}
              isDeleting={deleteEmbed.isPending}
              onLoad={() => { onLoadEmbed(t); onOpenChange(false); }}
              onCopy={() => createEmbed.mutate({
                name: `${t.name} (copy)`,
                title: t.title,
                description: t.description,
                color: t.color,
                fields: t.fields,
                footer: t.footer,
                imageUrl: t.imageUrl,
                thumbnailUrl: t.thumbnailUrl,
                authorName: t.authorName,
                authorIconUrl: t.authorIconUrl,
              })}
              onDelete={() => deleteEmbed.mutate(t.id)}
            />
          ))}

          {mode === "component" && containers.data?.map((t) => (
            <TemplateRow
              key={t.id}
              name={t.name}
              isDeleting={deleteContainer.isPending}
              onLoad={() => { onLoadComponent(t); onOpenChange(false); }}
              onCopy={() => createContainer.mutate({
                name: `${t.name} (copy)`,
                template_data: t.template_data,
              })}
              onDelete={() => deleteContainer.mutate(t.id)}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessageBuilderPage() {
  const params = useParams<{ factionId: string }>();
  const factionId = params.factionId;

  const [mode, setMode] = useState<MessageMode>("text");
  const [sendVia, setSendVia] = useState<"bot" | "webhook">("bot");
  const [channelId, setChannelId] = useState("");
  const [webhookUrls, setWebhookUrls] = useState<string[]>([""]);
  const [webhookUsername, setWebhookUsername] = useState("");
  const [webhookAvatarUrl, setWebhookAvatarUrl] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  // Name lives in the sheet input
  const [templateName, setTemplateName] = useState("");

  // Builder content state — bump key to remount builders when loading
  const [builderKey, setBuilderKey] = useState(0);
  const [textContent, setTextContent] = useState("");
  const [loadedEmbed, setLoadedEmbed] = useState<Partial<EmbedTemplate> | null>(null);
  const [loadedItems, setLoadedItems] = useState<C2TopLevelItem[]>([]);

  // Saved template tracking for send-after-save flow
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null);
  const [savedTemplateType, setSavedTemplateType] = useState<string | null>(null);

  // Submit refs for embed / component builders
  const embedSubmitRef = useRef<(() => void) | null>(null);
  const componentSubmitRef = useRef<(() => void) | null>(null);
  // When true, the next successful save will immediately trigger a send
  const pendingSendRef = useRef(false);
  const pendingDestRef = useRef<{ channel_id?: string; webhook_urls?: string[]; webhook_username?: string; webhook_avatar_url?: string }>({});

  // Send mutation + history
  const sendMessage = useSendMessage(factionId);
  const messageHistory = useMessageHistory(factionId);
  // Only show status for sends triggered in this session, not historical data.
  const [hasSentThisSession, setHasSentThisSession] = useState(false);
  const lastSend = hasSentThisSession ? messageHistory.data?.[0] : null;

  const createEmbed = useCreateEmbedTemplate(factionId);
  const createContainer = useCreateContainerTemplate(factionId);
  const createText = useCreateTextTemplate(factionId);

  const isSaving = createEmbed.isPending || createContainer.isPending || createText.isPending;

  // ── Load handlers ──────────────────────────────────────────────────────────

  function loadText(t: TextTemplate) {
    setMode("text");
    setTemplateName(t.name);
    setTextContent(t.content);
    setSavedTemplateId(t.id);
    setSavedTemplateType("text");
    setBuilderKey((k) => k + 1);
    toast.success(`Loaded "${t.name}"`);
  }

  function loadEmbed(t: EmbedTemplate) {
    setMode("embed");
    setTemplateName(t.name);
    setLoadedEmbed(t);
    setSavedTemplateId(t.id);
    setSavedTemplateType("embed");
    setBuilderKey((k) => k + 1);
    toast.success(`Loaded "${t.name}"`);
  }

  function loadComponent(t: ContainerTemplate) {
    setMode("component");
    setTemplateName(t.name);
    setLoadedItems((t.template_data?.components as C2TopLevelItem[]) ?? []);
    setSavedTemplateId(t.id);
    setSavedTemplateType("container");
    setBuilderKey((k) => k + 1);
    toast.success(`Loaded "${t.name}"`);
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  function handleSave() {
    const name = templateName.trim();
    if (!name) {
      toast.error("Enter a name before saving");
      return;
    }
    if (mode === "text") {
      if (!textContent.trim()) { toast.error("Message cannot be empty"); return; }
      createText.mutate(
        { name, content: textContent },
        {
          onSuccess: (created) => {
            setSavedTemplateId(created.id);
            setSavedTemplateType("text");
            if (pendingSendRef.current) {
              pendingSendRef.current = false;
              setHasSentThisSession(true);
              sendMessage.mutate({ ...pendingDestRef.current, template_type: "text", template_id: created.id });
            }
          },
        }
      );
      return;
    }
    if (mode === "embed") {
      embedSubmitRef.current?.();
      return;
    }
    if (mode === "component") {
      componentSubmitRef.current?.();
    }
  }

  function handleEmbedSave(form: EmbedFormData) {
    createEmbed.mutate(
      {
        name: templateName.trim() || form.name,
        title: form.title || undefined,
        description: form.description || undefined,
        color: form.color || undefined,
        fields: form.fields?.length ? form.fields : undefined,
        footer: form.footerText || undefined,
        imageUrl: form.imageUrl || undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
        authorName: form.authorName || undefined,
        authorIconUrl: form.authorIconUrl || undefined,
      },
      {
        onSuccess: (created) => {
          setSavedTemplateId(created.id);
          setSavedTemplateType("embed");
          if (pendingSendRef.current) {
            pendingSendRef.current = false;
            setHasSentThisSession(true);
            sendMessage.mutate({ ...pendingDestRef.current, template_type: "embed", template_id: created.id });
          }
        },
      }
    );
  }

  function handleComponentSave(items: C2TopLevelItem[]) {
    createContainer.mutate(
      {
        name: templateName.trim() || `Component ${new Date().toLocaleTimeString()}`,
        template_data: { components: items },
      },
      {
        onSuccess: (created) => {
          setSavedTemplateId(created.id);
          setSavedTemplateType("container");
          if (pendingSendRef.current) {
            pendingSendRef.current = false;
            setHasSentThisSession(true);
            sendMessage.mutate({ ...pendingDestRef.current, template_type: "container", template_id: created.id });
          }
        },
      }
    );
  }

  function handleSend() {
    if (sendVia === "bot" && !channelId.trim()) {
      toast.error("Enter a channel ID");
      return;
    }
    if (sendVia === "webhook") {
      const validUrls = webhookUrls.map((u) => u.trim()).filter(Boolean);
      if (validUrls.length === 0) {
        toast.error("Enter at least one webhook URL");
        return;
      }
    }
    const validWebhookUrls = webhookUrls.map((u) => u.trim()).filter(Boolean);
    const destination = sendVia === "webhook"
      ? {
          webhook_urls: validWebhookUrls,
          ...(webhookUsername.trim() ? { webhook_username: webhookUsername.trim() } : {}),
          ...(webhookAvatarUrl.trim() ? { webhook_avatar_url: webhookAvatarUrl.trim() } : {}),
        }
      : { channel_id: channelId.trim() };

    // Already have a saved template — send immediately
    if (savedTemplateId && savedTemplateType) {
      setHasSentThisSession(true);
      sendMessage.mutate({ ...destination, template_type: savedTemplateType, template_id: savedTemplateId });
      return;
    }
    // No saved template yet — auto-save then send
    pendingSendRef.current = true;
    pendingDestRef.current = destination;
    handleSave();
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Message Builder</h1>
        <p className="text-muted-foreground">
          Compose and send messages to your Discord server.
        </p>
      </div>

      {/* ── Action bar ── */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Mode toggle */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Message Type
            </p>
            <div className="flex overflow-hidden rounded-lg border border-border">
              {MODES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setMode(value);
                    setSavedTemplateId(null);
                    setSavedTemplateType(null);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors",
                    "border-r border-border last:border-r-0",
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

          {/* Send-via toggle */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Send Via
            </p>
            <div className="flex overflow-hidden rounded-lg border border-border">
              {(["bot", "webhook"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSendVia(v)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors border-r border-border last:border-r-0 capitalize",
                    sendVia === v
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="ml-auto space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Actions
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setSheetOpen(true)} variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Messages
              </Button>
              <Button
                variant="outline"
                onClick={handleSend}
                disabled={
                  (sendVia === "bot" ? !channelId.trim() : !webhookUrls.some((u) => u.trim())) ||
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

              {/* Last send status indicator */}
              {lastSend && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {lastSend.status === "sent" && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  )}
                  {lastSend.status === "pending" && (
                    <Clock className="h-3.5 w-3.5 text-yellow-500" />
                  )}
                  {lastSend.status === "failed" && (
                    <XCircle className="h-3.5 w-3.5 text-destructive" />
                  )}
                  <span className="capitalize">{lastSend.status}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Destination ── full-width below action bar */}
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
            {/* Webhook URLs */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Webhook URLs
              </Label>
              <div className="space-y-2">
                {webhookUrls.map((url, i) => (
                  <div key={i} className="flex gap-1.5">
                    <Input
                      placeholder="https://discord.com/api/webhooks/..."
                      value={url}
                      onChange={(e) => {
                        const next = [...webhookUrls];
                        next[i] = e.target.value;
                        setWebhookUrls(next);
                      }}
                    />
                    {webhookUrls.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 shrink-0 text-destructive hover:text-destructive"
                        onClick={() => setWebhookUrls(webhookUrls.filter((_, j) => j !== i))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
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
            {/* Identity overrides */}
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

      {/* ── Compose area ── */}
      {mode === "text" && (
        <Card className="space-y-3 p-4">
          <Label htmlFor="textContent">Message Content</Label>
          <textarea
            id="textContent"
            key={builderKey}
            rows={8}
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={"Type your message…\n\nVariables: {{username}}, {{faction_name}}, {{rank}}"}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
          />
        </Card>
      )}

      {mode === "embed" && (
        <EmbedBuilder
          key={builderKey}
          template={loadedEmbed}
          onSave={handleEmbedSave}
          isSaving={createEmbed.isPending}
          submitRef={embedSubmitRef}
          webhookUsername={sendVia === "webhook" ? webhookUsername : undefined}
          webhookAvatarUrl={sendVia === "webhook" ? webhookAvatarUrl : undefined}
        />
      )}

      {mode === "component" && (
        <ComponentV2BuilderV2
          key={builderKey}
          initialItems={loadedItems}
          onSave={handleComponentSave}
          isSaving={createContainer.isPending}
          submitRef={componentSubmitRef}
          factionId={factionId}
          webhookUsername={sendVia === "webhook" ? webhookUsername : undefined}
          webhookAvatarUrl={sendVia === "webhook" ? webhookAvatarUrl : undefined}
        />
      )}

      {/* ── Messages sheet ── */}
      <MessagesSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={mode}
        factionId={factionId}
        templateName={templateName}
        onTemplateNameChange={setTemplateName}
        onSave={handleSave}
        isSaving={isSaving}
        onLoadText={loadText}
        onLoadEmbed={loadEmbed}
        onLoadComponent={loadComponent}
      />
    </div>
  );
}
