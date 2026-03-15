"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmbedPreview } from "@/components/discord-preview/embed-preview";
import { EmbedBuilder, type EmbedFormData } from "@/components/templates/embed-builder";
import { useEmbedTemplates, useCreateEmbedTemplate, useUpdateEmbedTemplate } from "@/hooks/use-templates";
import { formatDate, truncateText } from "@/lib/utils";
import { PERMISSION_KEYS } from "@/lib/constants";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Plus, Pencil } from "lucide-react";

export default function EmbedTemplatesPage() {
  const params = useParams<{ factionId: string }>();
  const factionId = params.factionId;
  const qp = useSearchParams();
  const initialId = qp.get("id") ?? undefined;

  const { data, isLoading } = useEmbedTemplates(factionId);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialId);

  const selectedTemplate = useMemo(() => data?.find((t) => t.id === selectedId) ?? null, [data, selectedId]);

  const createMutation = useCreateEmbedTemplate(factionId);
  const updateMutation = useUpdateEmbedTemplate(factionId, selectedId ?? "");

  function handleSave(form: EmbedFormData) {
    if (!selectedId) {
      createMutation.mutate({
        name: form.name,
        title: form.title || undefined,
        description: form.description || undefined,
        color: form.color || undefined,
        fields: form.fields?.length ? form.fields : undefined,
        imageUrl: form.imageUrl || undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
        footer: form.footerText || undefined,
        authorName: form.authorName || undefined,
        authorIconUrl: form.authorIconUrl || undefined,
      }, {
        onSuccess: (tpl) => setSelectedId(tpl.id),
      });
    } else {
      updateMutation.mutate({
        name: form.name,
        title: form.title || undefined,
        description: form.description || undefined,
        color: form.color || undefined,
        fields: form.fields?.length ? form.fields : undefined,
        imageUrl: form.imageUrl || undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
        footer: form.footerText || undefined,
        authorName: form.authorName || undefined,
        authorIconUrl: form.authorIconUrl || undefined,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Embed Templates</h1>
          <p className="text-muted-foreground">Create rich Discord embeds with a visual builder.</p>
        </div>
        <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_CREATE}>
          <Button onClick={() => setSelectedId(undefined)} size="sm">
            <Plus className="mr-2 h-4 w-4" /> New Template
          </Button>
        </PermissionGate>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        {/* Left: List */}
        <Card className="p-3">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {data?.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedId(tpl.id)}
                  className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-md border">
                    <EmbedPreview title={tpl.title} description={tpl.description} color={tpl.color} fields={tpl.fields} className="scale-50 origin-top-left" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{tpl.name}</div>
                    <div className="truncate text-xs text-muted-foreground">Created {formatDate(tpl.createdAt)}</div>
                  </div>
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Right: Builder */}
        <div>
          <EmbedBuilder template={selectedTemplate ?? undefined} isSaving={createMutation.isPending || updateMutation.isPending} onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}
