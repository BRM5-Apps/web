"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { useAllTemplates } from "@/hooks/use-templates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WelcomeConfig {
  id?: string;
  enabled: boolean;
  channel_id: string;
  assign_rank_id?: string | null;
  embed_template_id?: string | null;
  text_template_id?: string | null;
  container_template_id?: string | null;
}

type TemplateKind = "none" | "text" | "embed" | "container";

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  enabled: z.boolean(),
  channel_id: z.string(),
});

type FormData = z.infer<typeof schema>;

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useWelcomeConfig(factionId: string) {
  return useQuery<WelcomeConfig>({
    queryKey: queryKeys.config.welcome(factionId),
    queryFn: ({ signal }) => api.config.getWelcome(factionId, { signal }) as unknown as Promise<WelcomeConfig>,
    enabled: !!factionId,
  });
}

function useUpdateWelcomeConfig(factionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<WelcomeConfig>) => api.config.updateWelcome(factionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.config.welcome(factionId) });
    },
  });
}

// ─── Page ────────────────────────────────────────────────────────────────────

const KIND_LABELS: Record<TemplateKind, string> = {
  none: "None",
  text: "Text",
  embed: "Embed",
  container: "Container",
};

export default function WelcomeSettingsPage() {
  const params = useParams<{ factionId: string }>();
  const factionId = params.factionId;
  const { data: config, isLoading } = useWelcomeConfig(factionId);
  const updateMutation = useUpdateWelcomeConfig(factionId);
  const templates = useAllTemplates(factionId);

  const { register, handleSubmit, reset, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { enabled: false, channel_id: "" },
  });

  const enabled = watch("enabled");

  // Template selection state — separate from RHF since it maps to multiple fields
  const [templateKind, setTemplateKind] = useState<TemplateKind>("none");
  const [templateId, setTemplateId] = useState<string>("");

  useEffect(() => {
    if (config) {
      reset({
        enabled: config.enabled,
        channel_id: config.channel_id ?? "",
      });
      // Determine current template kind from config
      if (config.text_template_id) {
        setTemplateKind("text");
        setTemplateId(config.text_template_id);
      } else if (config.embed_template_id) {
        setTemplateKind("embed");
        setTemplateId(config.embed_template_id);
      } else if (config.container_template_id) {
        setTemplateKind("container");
        setTemplateId(config.container_template_id);
      } else {
        setTemplateKind("none");
        setTemplateId("");
      }
    }
  }, [config, reset]);

  function handleKindChange(kind: TemplateKind) {
    setTemplateKind(kind);
    setTemplateId(""); // reset template selection when kind changes
  }

  function onSubmit(data: FormData) {
    const payload: Partial<WelcomeConfig> = {
      ...data,
      // Clear all template IDs, then set the active one
      embed_template_id: null,
      text_template_id: null,
      container_template_id: null,
    };
    if (templateKind === "text" && templateId) payload.text_template_id = templateId;
    else if (templateKind === "embed" && templateId) payload.embed_template_id = templateId;
    else if (templateKind === "container" && templateId) payload.container_template_id = templateId;

    updateMutation.mutate(payload, {
      onSuccess: () => toast.success("Welcome settings saved"),
      onError: () => toast.error("Failed to save settings"),
    });
  }

  const templateOptions =
    templateKind === "text"
      ? templates.texts
      : templateKind === "embed"
      ? templates.embeds
      : templateKind === "container"
      ? templates.containers
      : [];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome & Goodbye</h1>
          <p className="text-muted-foreground">Automated messages when members join or leave.</p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome & Goodbye</h1>
        <p className="text-muted-foreground">
          Configure automated messages when members join or leave your server.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome Message</CardTitle>
            <CardDescription>
              Sent to the specified channel when a member joins.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Enable welcome messages</Label>
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={(v) => setValue("enabled", v)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="channel_id">Discord Channel ID</Label>
              <Input
                id="channel_id"
                placeholder="123456789012345678"
                {...register("channel_id")}
              />
              <p className="text-xs text-muted-foreground">
                Right-click a channel in Discord and copy its ID.
              </p>
            </div>

            {/* Template selector */}
            <div className="space-y-3">
              <Label>Welcome Message Template</Label>

              {/* Kind toggle */}
              <div className="flex rounded-md overflow-hidden border border-input">
                {(["none", "text", "embed", "container"] as TemplateKind[]).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => handleKindChange(kind)}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium capitalize transition-colors",
                      templateKind === kind
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {KIND_LABELS[kind]}
                  </button>
                ))}
              </div>

              {/* Template dropdown */}
              {templateKind !== "none" && (
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  disabled={templates.isLoading}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">
                    {templates.isLoading
                      ? "Loading templates…"
                      : `Select a ${templateKind} template…`}
                  </option>
                  {templateOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}

              {templateKind !== "none" && templateOptions.length === 0 && !templates.isLoading && (
                <p className="text-xs text-muted-foreground">
                  No {templateKind} templates saved yet. Create one in the Templates section.
                </p>
              )}

              {templateKind === "none" && (
                <p className="text-xs text-muted-foreground">
                  No message will be sent. Select a template type to configure a welcome message.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
