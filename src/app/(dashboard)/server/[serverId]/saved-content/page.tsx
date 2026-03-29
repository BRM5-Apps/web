"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmbedPreview } from "@/components/discord-preview/embed-preview";
import { ContainerPreview } from "@/components/discord-preview/container-preview";
import {
  useEmbedTemplates,
  useContainerTemplates,
  useTextTemplates,
  useModalTemplates,
  useDeleteEmbedTemplate,
  useDeleteContainerTemplate,
  useDeleteTextTemplate,
  useDeleteModalTemplate,
} from "@/hooks/use-templates";
import { useScheduledSequences } from "@/hooks/use-scheduled-sequences";
import { useContentFolders, useDeleteContentFolder } from "@/hooks/use-content-folders";
import { formatDate, truncateText } from "@/lib/utils";
import { PERMISSION_KEYS } from "@/lib/constants";
import { PermissionGate } from "@/components/shared/permission-gate";
import { FolderCard } from "@/components/content-folders/folder-card";
import { CreateFolderDialog } from "@/components/content-folders/create-folder-dialog";
import {
  Trash2,
  Pencil,
  Plus,
  Code,
  MessageSquare,
  FileText,
  LayoutTemplate,
  GitBranch,
  FolderOpen,
  LayoutGrid,
  Settings,
} from "lucide-react";

export default function SavedContentPage() {
  const params = useParams<{ serverId: string }>();
  const searchParams = useSearchParams();
  const serverId = params.serverId;
  const tabParam = searchParams.get("tab");

  const defaultTab = tabParam || "all";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  const embeds = useEmbedTemplates(serverId);
  const containers = useContainerTemplates(serverId);
  const texts = useTextTemplates(serverId);
  const modals = useModalTemplates(serverId);
  const automations = useScheduledSequences(serverId);

  const deleteEmbed = useDeleteEmbedTemplate(serverId);
  const deleteContainer = useDeleteContainerTemplate(serverId);
  const deleteText = useDeleteTextTemplate(serverId);
  const deleteModal = useDeleteModalTemplate(serverId);

  const isLoading =
    embeds.isLoading ||
    containers.isLoading ||
    texts.isLoading ||
    modals.isLoading ||
    automations.isLoading;

  const totalEmbeds = embeds.data?.length ?? 0;
  const totalContainers = containers.data?.length ?? 0;
  const totalTexts = texts.data?.length ?? 0;
  const totalModals = modals.data?.length ?? 0;
  const totalAutomations = automations.data?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Content</h1>
          <p className="text-muted-foreground">
            Manage your saved embeds, containers, text messages, modals, and automations.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">
              <LayoutGrid className="mr-1.5 h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="folders">
              <FolderOpen className="mr-1.5 h-4 w-4" />
              Folders
            </TabsTrigger>
            <TabsTrigger value="embeds">
              <Code className="mr-1.5 h-4 w-4" />
              Embeds
            </TabsTrigger>
            <TabsTrigger value="containers">
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Containers
            </TabsTrigger>
            <TabsTrigger value="text">
              <FileText className="mr-1.5 h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="modals">
              <LayoutTemplate className="mr-1.5 h-4 w-4" />
              Modals
            </TabsTrigger>
            <TabsTrigger value="automations">
              <GitBranch className="mr-1.5 h-4 w-4" />
              Automations
            </TabsTrigger>
            <TabsTrigger value="defaults">
              <Settings className="mr-1.5 h-4 w-4" />
              Defaults
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            {activeTab === "folders" ? (
              <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_CREATE}>
                <Button size="sm" onClick={() => setCreateFolderOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Folder
                </Button>
              </PermissionGate>
            ) : (
              <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_CREATE}>
                <Link href={`/server/${serverId}/message-builder`} prefetch>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Message
                  </Button>
                </Link>
              </PermissionGate>
            )}
          </div>
        </div>

        <TabsContent value="all" className="space-y-6">
          {isLoading ? (
            <TemplatesSkeleton />
          ) : (
            <>
              {/* Embeds Section */}
              {totalEmbeds > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Code className="h-5 w-5 text-muted-foreground" />
                      Embeds
                      <Badge variant="secondary" className="font-normal">
                        {totalEmbeds}
                      </Badge>
                    </h2>
                    <Link
                      href={`/server/${serverId}/saved-content/embeds`}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {embeds.data?.slice(0, 4).map((tpl) => (
                      <TemplateCard
                        key={tpl.id}
                        type="embed"
                        serverId={serverId}
                        id={tpl.id}
                        name={tpl.name}
                        createdAt={tpl.createdAt}
                        onDelete={() => deleteEmbed.mutate(tpl.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Containers Section */}
              {totalContainers > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      Containers
                      <Badge variant="secondary" className="font-normal">
                        {totalContainers}
                      </Badge>
                    </h2>
                    <Link
                      href={`/server/${serverId}/saved-content/containers`}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {containers.data?.slice(0, 4).map((tpl) => (
                      <TemplateCard
                        key={tpl.id}
                        type="container"
                        serverId={serverId}
                        id={tpl.id}
                        name={tpl.name}
                        createdAt={tpl.createdAt}
                        onDelete={() => deleteContainer.mutate(tpl.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Text Section */}
              {totalTexts > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      Text
                      <Badge variant="secondary" className="font-normal">
                        {totalTexts}
                      </Badge>
                    </h2>
                    <Link
                      href={`/server/${serverId}/saved-content/text`}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {texts.data?.slice(0, 4).map((tpl) => (
                      <TemplateCard
                        key={tpl.id}
                        type="text"
                        serverId={serverId}
                        id={tpl.id}
                        name={tpl.name}
                        createdAt={tpl.createdAt}
                        onDelete={() => deleteText.mutate(tpl.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Modals Section */}
              {totalModals > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
                      Modals
                      <Badge variant="secondary" className="font-normal">
                        {totalModals}
                      </Badge>
                    </h2>
                    <Link
                      href={`/server/${serverId}/saved-content/modals`}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {modals.data?.slice(0, 4).map((modal) => {
                      const fieldCount =
                        (modal.template_data as any)?.pages?.reduce(
                          (acc: number, p: any) => acc + (p.components?.length ?? 0),
                          0
                        ) ?? 0;
                      return (
                        <Card key={modal.id} className="group relative overflow-hidden p-4">
                          <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
                              <Button variant="ghost" size="icon" asChild>
                                <Link
                                  href={`/server/${serverId}/modal-builder/${modal.id}`}
                                  aria-label="Edit modal"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                            </PermissionGate>
                            <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Delete modal"
                                onClick={() => deleteModal.mutate(modal.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PermissionGate>
                          </div>
                          <div className="mb-3 flex items-start gap-3 pr-16">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#5865F2]/20">
                              <LayoutTemplate className="h-5 w-5 text-[#5865F2]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium">{modal.name}</div>
                              <div className="truncate text-xs text-muted-foreground">
                                {fieldCount} field{fieldCount !== 1 ? "s" : ""} · Created{" "}
                                {formatDate(modal.createdAt)}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Automations Section */}
              {totalAutomations > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-muted-foreground" />
                      Automations
                      <Badge variant="secondary" className="font-normal">
                        {totalAutomations}
                      </Badge>
                    </h2>
                    <Link
                      href={`/server/${serverId}/saved-content/automations`}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {automations.data?.slice(0, 3).map((seq) => (
                      <Card key={seq.id} className="group relative overflow-hidden p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#5865F2]/20">
                            <GitBranch className="h-5 w-5 text-[#5865F2]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">{seq.name}</div>
                            <div className="truncate text-xs text-muted-foreground">
                              {seq.trigger_type === "TIME" ? "Time-based" : seq.event_type} ·{" "}
                              {seq.run_count} runs
                            </div>
                            <Badge
                              variant="secondary"
                              className="mt-1 text-xs"
                            >
                              {seq.is_active ? "Active" : "Paused"}
                            </Badge>
                          </div>
                        </div>
                        <Link
                          href={`/server/${serverId}/automations`}
                          className="absolute inset-0"
                          aria-label="View automations"
                        />
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state when no content */}
              {totalEmbeds === 0 &&
                totalContainers === 0 &&
                totalTexts === 0 &&
                totalModals === 0 &&
                totalAutomations === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <LayoutGrid className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium">No saved content yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                      Create embeds, containers, text messages, modals, and automations to manage your Discord server.
                    </p>
                    <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_CREATE}>
                      <Link href={`/server/${serverId}/message-builder`} className="mt-4">
                        <Button size="sm">
                          <Plus className="mr-1.5 h-4 w-4" />
                          Create your first content
                        </Button>
                      </Link>
                    </PermissionGate>
                  </div>
                )}
            </>
          )}
        </TabsContent>

        <TabsContent value="folders" className="space-y-4">
          <FoldersTabContent serverId={serverId} />
        </TabsContent>

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
                        <Link
                          href={`/server/${serverId}/message-builder?type=embed&id=${tpl.id}`}
                          aria-label="Edit template"
                        >
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
                      <div className="truncate text-xs text-muted-foreground">
                        Created {formatDate(tpl.createdAt)}
                      </div>
                    </div>
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
                        <Link href={`/server/${serverId}/message-builder?type=container&id=${tpl.id}`}>
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
                      <div className="truncate text-xs text-muted-foreground">
                        Created {formatDate(tpl.createdAt)}
                      </div>
                    </div>
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
                        <Link href={`/server/${serverId}/message-builder?type=text&id=${tpl.id}`}>
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
                      <div className="truncate text-xs text-muted-foreground">
                        Created {formatDate(tpl.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                    {truncateText(tpl.content, 160)}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="modals" className="space-y-4">
          {modals.isLoading ? (
            <TemplatesSkeleton />
          ) : modals.data && modals.data.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {modals.data.map((modal) => {
                const fieldCount =
                  (modal.template_data as any)?.pages?.reduce(
                    (acc: number, p: any) => acc + (p.components?.length ?? 0),
                    0
                  ) ?? 0;
                return (
                  <Card key={modal.id} className="group relative overflow-hidden p-4">
                    <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/server/${serverId}/modal-builder/${modal.id}`}
                            aria-label="Edit modal"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete modal"
                          onClick={() => deleteModal.mutate(modal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                    </div>
                    <div className="mb-3 flex items-start gap-3 pr-16">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#5865F2]/20">
                        <LayoutTemplate className="h-5 w-5 text-[#5865F2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{modal.name}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {fieldCount} field{fieldCount !== 1 ? "s" : ""} · Created{" "}
                          {formatDate(modal.createdAt)}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <LayoutTemplate className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium">No modals yet</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                Create Discord forms that users can fill out via commands or actions.
              </p>
              <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_CREATE}>
                <Link href={`/server/${serverId}/modal-builder`} className="mt-4">
                  <Button size="sm">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create your first modal
                  </Button>
                </Link>
              </PermissionGate>
            </div>
          )}
        </TabsContent>

        <TabsContent value="automations" className="space-y-4">
          {automations.isLoading ? (
            <TemplatesSkeleton />
          ) : automations.data && automations.data.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {automations.data.map((seq) => (
                <Card key={seq.id} className="group relative overflow-hidden p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#5865F2]/20">
                      <GitBranch className="h-5 w-5 text-[#5865F2]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{seq.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {seq.is_active ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {seq.trigger_type === "TIME" ? "Time-based" : seq.event_type} · {seq.run_count} runs
                      </div>
                      {seq.cron_expression && (
                        <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                          {seq.cron_expression}
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/server/${serverId}/automations`}
                    className="absolute inset-0"
                    aria-label="View automations"
                  />
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <GitBranch className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium">No automations yet</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                Build workflows with time-based or event-based triggers.
              </p>
              <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_CREATE}>
                <Link href={`/server/${serverId}/automations`} className="mt-4">
                  <Button size="sm">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create your first automation
                  </Button>
                </Link>
              </PermissionGate>
            </div>
          )}
        </TabsContent>

        <TabsContent value="defaults" className="space-y-4">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Settings className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium">Default Messages</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              Customize default messages used throughout your server, such as verification prompts, welcome messages, and error responses.
            </p>
            <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
              <Link href={`/server/${serverId}/saved-content/defaults`} className="mt-4">
                <Button size="sm">
                  <Settings className="mr-1.5 h-4 w-4" />
                  Manage Default Messages
                </Button>
              </Link>
            </PermissionGate>
          </div>
        </TabsContent>
      </Tabs>

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        serverId={serverId}
      />
    </div>
  );
}

// Template card for the "All" tab
function TemplateCard({
  type,
  serverId,
  id,
  name,
  createdAt,
  onDelete,
}: {
  type: "embed" | "container" | "text";
  serverId: string;
  id: string;
  name: string;
  createdAt: string;
  onDelete: () => void;
}) {
  const typeConfig = {
    embed: {
      icon: Code,
      href: `/server/${serverId}/message-builder?type=embed&id=${id}`,
      color: "bg-[#5865F2]/20",
      iconColor: "text-[#5865F2]",
    },
    container: {
      icon: MessageSquare,
      href: `/server/${serverId}/message-builder?type=container&id=${id}`,
      color: "bg-[#43B581]/20",
      iconColor: "text-[#43B581]",
    },
    text: {
      icon: FileText,
      href: `/server/${serverId}/message-builder?type=text&id=${id}`,
      color: "bg-[#FAA61A]/20",
      iconColor: "text-[#FAA61A]",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Card className="group relative overflow-hidden p-4">
      <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
          <Button variant="ghost" size="icon" asChild>
            <Link href={config.href} aria-label="Edit template">
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </PermissionGate>
        <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
          <Button variant="ghost" size="icon" aria-label="Delete template" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </PermissionGate>
      </div>
      <div className="flex items-center gap-3 pr-16">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${config.color}`}>
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{name}</div>
          <div className="truncate text-xs text-muted-foreground">Created {formatDate(createdAt)}</div>
        </div>
      </div>
    </Card>
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

// ─── Folders Tab Content ───────────────────────────────────────────────────────

function FoldersTabContent({ serverId }: { serverId: string }) {
  const folders = useContentFolders(serverId);
  const deleteFolder = useDeleteContentFolder(serverId);

  const handleDeleteFolder = (folderId: string) => {
    if (confirm("Are you sure you want to delete this folder? Items inside will not be deleted.")) {
      deleteFolder.mutate(folderId);
    }
  };

  if (folders.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!folders.data || folders.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FolderOpen className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium">No folders yet</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs">
          Organize your saved content into folders for easy management and sharing. Click "New Folder" above to create one.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="text-sm text-muted-foreground mb-4">
        {folders.data.length} folder{folders.data.length !== 1 ? "s" : ""}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {folders.data.map((folder) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            serverId={serverId}
            onDelete={() => handleDeleteFolder(folder.id)}
          />
        ))}
      </div>
    </>
  );
}