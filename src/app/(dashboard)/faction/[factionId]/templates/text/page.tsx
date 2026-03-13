"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DiscordMarkdown } from "@/components/discord-preview/discord-markdown";
import { useTextTemplates, useCreateTextTemplate, useUpdateTextTemplate } from "@/hooks/use-templates";
import { formatDate, truncateText } from "@/lib/utils";
import { PERMISSION_KEYS } from "@/lib/constants";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Plus } from "lucide-react";

const VARIABLES = [
  { key: "{{username}}", description: "The user's Discord username" },
  { key: "{{user_id}}", description: "The user's Discord ID" },
  { key: "{{rank}}", description: "The user's rank name" },
  { key: "{{unit}}", description: "The user's unit" },
  { key: "{{event_name}}", description: "Current event name" },
  { key: "{{timestamp}}", description: "Current timestamp" },
  { key: "{{faction_name}}", description: "Name of the faction" },
];

export default function TextTemplatesPage() {
  const params = useParams<{ factionId: string }>();
  const factionId = params.factionId;

  const { data, isLoading } = useTextTemplates(factionId);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const selected = useMemo(() => data?.find((t) => t.id === selectedId) ?? null, [data, selectedId]);
  const [name, setName] = useState<string>(selected?.name ?? "");
  const [content, setContent] = useState<string>(selected?.content ?? "");

  const createMutation = useCreateTextTemplate(factionId);
  const updateMutation = useUpdateTextTemplate(factionId, selectedId ?? "");

  function selectTemplate(id?: string) {
    setSelectedId(id);
    const tpl = data?.find((t) => t.id === id) ?? null;
    setName(tpl?.name ?? "");
    setContent(tpl?.content ?? "");
  }

  function handleInsertVariable(v: string) {
    setContent((prev) => (prev ?? "") + v);
  }

  const sampleData: Record<string, string> = {
    username: "Ghost",
    user_id: "123456789012345678",
    rank: "Captain",
    unit: "Infantry",
    event_name: "Operation Dawn",
    timestamp: new Date().toISOString(),
    faction_name: "Phantoms",
  };

  function renderTemplate(str: string): string {
    return str.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_m, key) => sampleData[key] ?? `{{${key}}}`);
  }

  function handleSave() {
    if (!selectedId) {
      createMutation.mutate({ name, content }, { onSuccess: (tpl) => setSelectedId(tpl.id) });
    } else {
      updateMutation.mutate({ name, content });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Text Templates</h1>
          <p className="text-muted-foreground">Design plain message templates with variables and live preview.</p>
        </div>
        <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_CREATE}>
          <Button onClick={() => selectTemplate(undefined)} size="sm">
            <Plus className="mr-2 h-4 w-4" /> New Template
          </Button>
        </PermissionGate>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr_360px]">
        {/* List */}
        <Card className="p-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {data?.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => selectTemplate(tpl.id)}
                  className="w-full rounded-md p-2 text-left hover:bg-accent"
                >
                  <div className="truncate font-medium">{tpl.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{truncateText(tpl.content, 96)}</div>
                  <div className="truncate text-[11px] text-muted-foreground">Created {formatDate(tpl.createdAt)}</div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Editor */}
        <Card className="p-4">
          <div className="mb-2 text-sm font-medium text-muted-foreground">Template Editor</div>
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-sm text-muted-foreground">Name</div>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" />
            </div>
            <div>
              <div className="mb-1 text-sm text-muted-foreground">Content</div>
              <div className="flex items-start gap-2">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={14}
                  className="min-h-[300px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none"
                  placeholder="Write your message here... Use variables like {{username}}."
                />
                <div className="flex w-[48px] shrink-0 flex-col gap-2">
                  {VARIABLES.map((v) => (
                    <Button key={v.key} variant="outline" size="icon" type="button" title={v.key} onClick={() => handleInsertVariable(v.key)}>
                      {v.key.replace(/[{}/]/g, "").slice(0, 2).toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={!name || !content}>
                Save Template
              </Button>
            </div>
          </div>
        </Card>

        {/* Variables + Preview */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-2 text-sm font-medium text-muted-foreground">Variables</div>
            <div className="space-y-2">
              {VARIABLES.map((v) => (
                <div key={v.key} className="rounded-md border p-2">
                  <div className="font-mono text-sm">{v.key}</div>
                  <div className="text-xs text-muted-foreground">{v.description}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-2 text-sm font-medium text-muted-foreground">Preview</div>
            <div className="rounded-md border border-[#1e1f22] bg-[#2b2d31] p-3">
              <DiscordMarkdown content={renderTemplate(content)} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
