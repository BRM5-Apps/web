"use client";

import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { EmbedBuilder, type EmbedFormData } from "@/components/templates/embed-builder";
import { ContainerBuilder } from "@/components/templates/container-builder";
import {
  useCreateEmbedTemplate,
  useCreateContainerTemplate,
  useCreateTextTemplate,
} from "@/hooks/use-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, Save, MessageSquare, FileImage, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessageBuilderPage() {
  const params = useParams<{ factionId: string }>();
  const factionId = params.factionId;

  const [mode, setMode] = useState<MessageMode>("text");
  const [channelId, setChannelId] = useState("");
  const [textContent, setTextContent] = useState("");

  // Refs that embed/container builders write their submit fns into
  const embedSubmitRef = useRef<(() => void) | null>(null);
  const containerSubmitRef = useRef<(() => void) | null>(null);

  const createEmbed = useCreateEmbedTemplate(factionId);
  const createContainer = useCreateContainerTemplate(factionId);
  const createText = useCreateTextTemplate(factionId);

  const isSaving = createEmbed.isPending || createContainer.isPending || createText.isPending;

  // ── Save as template ──────────────────────────────────────────────────────

  function handleSaveTemplate() {
    if (mode === "text") {
      if (!textContent.trim()) {
        toast.error("Message cannot be empty");
        return;
      }
      createText.mutate({ name: `Text message ${new Date().toLocaleTimeString()}`, content: textContent });
      return;
    }
    if (mode === "embed") {
      embedSubmitRef.current?.();
      return;
    }
    if (mode === "component") {
      containerSubmitRef.current?.();
    }
  }

  // ── Send to Discord ───────────────────────────────────────────────────────

  function handleSend() {
    if (!channelId.trim()) {
      toast.error("Enter a channel ID to send to");
      return;
    }
    // Bot send-to-channel endpoint not yet implemented
    toast.info("Direct send coming soon — save as a template and use the bot /send command.");
  }

  // ── Builder callbacks ─────────────────────────────────────────────────────

  function handleEmbedSave(form: EmbedFormData) {
    createEmbed.mutate(
      {
        name: form.name,
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
    );
  }

  function handleContainerSave(payload: {
    name: string;
    accentColor?: string;
    components: unknown[];
  }) {
    createContainer.mutate(
      { name: payload.name, accentColor: payload.accentColor, components: payload.components },
    );
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
                  onClick={() => setMode(value)}
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

          {/* Channel input */}
          <div className="min-w-[200px] flex-1 space-y-1.5">
            <Label
              htmlFor="channelId"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Target Channel ID
            </Label>
            <Input
              id="channelId"
              placeholder="123456789012345678"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveTemplate} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              Save as Template
            </Button>
            <Button onClick={handleSend} disabled={!channelId.trim()}>
              <Send className="mr-2 h-4 w-4" />
              Send to Discord
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Compose area ── */}
      {mode === "text" && (
        <Card className="space-y-3 p-4">
          <Label htmlFor="textContent">Message Content</Label>
          <textarea
            id="textContent"
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
          onSave={handleEmbedSave}
          isSaving={createEmbed.isPending}
          submitRef={embedSubmitRef}
        />
      )}

      {mode === "component" && (
        <ContainerBuilder
          onSave={handleContainerSave}
          isSaving={createContainer.isPending}
          submitRef={containerSubmitRef}
        />
      )}
    </div>
  );
}
