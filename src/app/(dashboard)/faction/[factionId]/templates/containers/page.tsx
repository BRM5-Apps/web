"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContainerPreview } from "@/components/discord-preview/container-preview";
import { ContainerBuilder } from "@/components/templates/container-builder";
import { useContainerTemplates, useCreateContainerTemplate, useUpdateContainerTemplate } from "@/hooks/use-templates";
import { formatDate } from "@/lib/utils";
import { PERMISSION_KEYS } from "@/lib/constants";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Plus, Pencil } from "lucide-react";

export default function ContainerTemplatesPage() {
  const params = useParams<{ factionId: string }>();
  const factionId = params.factionId;

  const { data, isLoading } = useContainerTemplates(factionId);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const selected = useMemo(() => data?.find((t) => t.id === selectedId) ?? null, [data, selectedId]);

  const createMutation = useCreateContainerTemplate(factionId);
  const updateMutation = useUpdateContainerTemplate(factionId, selectedId ?? "");

  function handleSave(payload: { name: string; accentColor?: string; components: any[] }) {
    const template_data = { components: payload.components, accentColor: payload.accentColor };
    if (!selectedId) {
      createMutation.mutate({ name: payload.name, template_data }, {
        onSuccess: (tpl) => setSelectedId(tpl.id),
      });
    } else {
      updateMutation.mutate({ name: payload.name, template_data });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Container Templates</h1>
          <p className="text-muted-foreground">Build interactive component layouts with action rows, buttons and more.</p>
        </div>
        <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_CREATE}>
          <Button onClick={() => setSelectedId(undefined)} size="sm">
            <Plus className="mr-2 h-4 w-4" /> New Template
          </Button>
        </PermissionGate>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        {/* List */}
        <Card className="p-4">
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
                  <div className="h-12 w-12 overflow-hidden rounded-md border p-1">
                    <ContainerPreview components={tpl.template_data?.components as any} />
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

        {/* Builder */}
        <div>
          <ContainerBuilder template={selected ?? undefined} onSave={handleSave} isSaving={createMutation.isPending || updateMutation.isPending} />
        </div>
      </div>
    </div>
  );
}
