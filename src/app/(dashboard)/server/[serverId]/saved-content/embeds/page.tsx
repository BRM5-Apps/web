"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmbedPreview } from "@/components/discord-preview/embed-preview";
import { EmbedBuilder, type EmbedFormData } from "@/components/templates/embed-builder";
import { useEmbedTemplates, useCreateEmbedTemplate, useUpdateEmbedTemplate, useDeleteEmbedTemplate } from "@/hooks/use-templates";
import { formatDate, truncateText } from "@/lib/utils";
import { PERMISSION_KEYS } from "@/lib/constants";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";

export default function SavedEmbedsPage() {
  const params = useParams<{ serverId: string }>();
  const serverId = params.serverId;
  const qp = useSearchParams();
  const initialId = qp.get("id") ?? undefined;

  const { data, isLoading } = useEmbedTemplates(serverId);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialId);

  const selectedTemplate = useMemo(() => data?.find((t) => t.id === selectedId) ?? null, [data, selectedId]);

  const createMutation = useCreateEmbedTemplate(serverId);
  const updateMutation = useUpdateEmbedTemplate(serverId, selectedId ?? "");
  const deleteMutation = useDeleteEmbedTemplate(serverId);

  function handleSave(form: EmbedFormData) {
    if (!selectedId) {
      createMutation.mutate(
        {
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
        },
        {
          onSuccess: (tpl) => setSelectedId(tpl.id),
        }
      );
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

  function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    deleteMutation.mutate(id);
    if (selectedId === id) setSelectedId(undefined);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/server/${serverId}/saved-content`}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Saved Embeds</h1>
            <p className="text-muted-foreground">Create rich Discord embeds with a visual builder.</p>
          </div>
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
                <div
                  key={tpl.id}
                  className={`flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent cursor-pointer ${
                    selectedId === tpl.id ? "bg-accent" : ""
                  }`}
                  onClick={() => setSelectedId(tpl.id)}
                >
                  <div className="h-12 w-12 overflow-hidden rounded-md border">
                    <EmbedPreview
                      title={tpl.title}
                      description={tpl.description}
                      color={tpl.color}
                      fields={tpl.fields}
                      className="scale-50 origin-top-left pointer-events-none"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{tpl.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      Created {formatDate(tpl.createdAt)}
                    </div>
                  </div>
                  <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete template"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(tpl.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </PermissionGate>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right: Builder */}
        <div>
          <EmbedBuilder
            template={selectedTemplate ?? undefined}
            isSaving={createMutation.isPending || updateMutation.isPending}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}