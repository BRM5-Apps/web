"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmbedPreview } from "@/components/discord-preview/embed-preview";
import { ContainerPreview } from "@/components/discord-preview/container-preview";
import { useEmbedTemplates, useContainerTemplates, useTextTemplates, useDeleteEmbedTemplate, useDeleteContainerTemplate, useDeleteTextTemplate } from "@/hooks/use-templates";
import { formatDate, truncateText } from "@/lib/utils";
import { PERMISSION_KEYS } from "@/lib/constants";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Trash2, Pencil, Plus } from "lucide-react";

export default function TemplatesOverviewPage() {
  const params = useParams<{ factionId: string }>();
  const factionId = params.factionId;

  const embeds = useEmbedTemplates(factionId);
  const containers = useContainerTemplates(factionId);
  const texts = useTextTemplates(factionId);

  const deleteEmbed = useDeleteEmbedTemplate(factionId);
  const deleteContainer = useDeleteContainerTemplate(factionId);
  const deleteText = useDeleteTextTemplate(factionId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Message Templates</h1>
          <p className="text-muted-foreground">Manage embeds, interactive containers, and text templates.</p>
        </div>
      </div>

      <Tabs defaultValue="embeds" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="embeds">Embeds</TabsTrigger>
            <TabsTrigger value="containers">Containers</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_CREATE}>
              <Link href={`./embeds`} prefetch>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </Link>
            </PermissionGate>
          </div>
        </div>

        <TabsContent value="embeds" className="space-y-4">
          {embeds.isLoading ? (
            <TemplatesSkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {embeds.data?.map((tpl) => (
                <Card key={tpl.id} className="group relative overflow-hidden p-4">
                  <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`./embeds?id=${tpl.id}`} aria-label="Edit template">
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </PermissionGate>
                    <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete template"
                        onClick={() => deleteEmbed.mutate(tpl.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </PermissionGate>
                  </div>
                  <div className="mb-3 flex items-center justify-between pr-16">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{tpl.name}</div>
                      <div className="truncate text-xs text-muted-foreground">Created {formatDate(tpl.createdAt)}</div>
                    </div>
                    {/* Default badge could be driven by tpl.isDefault if available */}
                    {false && <Badge>Default</Badge>}
                  </div>
                  <EmbedPreview
                    title={tpl.title}
                    description={tpl.description}
                    color={tpl.color}
                    fields={tpl.fields}
                    footer={{ text: tpl.footer ?? "" }}
                    image={{ url: tpl.imageUrl ?? "" }}
                    thumbnail={{ url: tpl.thumbnailUrl ?? "" }}
                    author={{ name: tpl.authorName ?? "" }}
                    className="pointer-events-none"
                  />
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="containers" className="space-y-4">
          {containers.isLoading ? (
            <TemplatesSkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {containers.data?.map((tpl) => (
                <Card key={tpl.id} className="group relative overflow-hidden p-4">
                  <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
                      <Button variant="ghost" size="icon" aria-label="Edit template" asChild>
                        <Link href={`./containers?id=${tpl.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </PermissionGate>
                    <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete template"
                        onClick={() => deleteContainer.mutate(tpl.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </PermissionGate>
                  </div>
                  <div className="mb-3 flex items-center justify-between pr-16">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{tpl.name}</div>
                      <div className="truncate text-xs text-muted-foreground">Created {formatDate(tpl.createdAt)}</div>
                    </div>
                    {false && <Badge>Default</Badge>}
                  </div>
                  <ContainerPreview components={tpl.template_data?.components as any} />
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          {texts.isLoading ? (
            <TemplatesSkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {texts.data?.map((tpl) => (
                <Card key={tpl.id} className="group relative overflow-hidden p-4">
                  <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
                      <Button variant="ghost" size="icon" asChild aria-label="Edit template">
                        <Link href={`./text?id=${tpl.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </PermissionGate>
                    <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete template"
                        onClick={() => deleteText.mutate(tpl.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </PermissionGate>
                  </div>
                  <div className="mb-3 flex items-center justify-between pr-16">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{tpl.name}</div>
                      <div className="truncate text-xs text-muted-foreground">Created {formatDate(tpl.createdAt)}</div>
                    </div>
                    {false && <Badge>Default</Badge>}
                  </div>
                  <div className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                    {truncateText(tpl.content, 160)}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TemplatesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-40 w-full" />
        </Card>
      ))}
    </div>
  );
}
