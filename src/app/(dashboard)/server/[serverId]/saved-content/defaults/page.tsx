"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDefaultMessages, useDefaultMessagesByCategory, useUpdateDefaultMessage } from "@/hooks/use-default-messages";
import { useEmbedTemplates, useContainerTemplates, useTextTemplates } from "@/hooks/use-templates";
import { PermissionGate } from "@/components/shared/permission-gate";
import { PERMISSION_KEYS } from "@/lib/constants";
import { CATEGORY_LABELS, DEFAULT_MESSAGE_KEYS, type DefaultMessage, type MessageCategory } from "@/types/default-message";
import {
  MessageSquare,
  FileText,
  Code,
  Shield,
  UserPlus,
  UserMinus,
  AlertCircle,
  ScrollText,
  Ticket,
  TrendingUp,
  TrendingDown,
  Pencil,
  Eye,
  Check,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EmbedPreview } from "@/components/discord-preview/embed-preview";
import { ContainerPreview } from "@/components/discord-preview/container-preview";
import { MessagePreview } from "@/components/discord-preview/message-preview";

const CATEGORY_ICONS: Record<MessageCategory, React.ElementType> = {
  ERROR: AlertCircle,
  LOG: ScrollText,
  COMMAND: MessageSquare,
  WELCOME: UserPlus,
  GOODBYE: UserMinus,
  PUNISHMENT: Shield,
  PROMOTION: TrendingUp,
  DEMOTION: TrendingDown,
  VERIFICATION: Shield,
  TICKET: Ticket,
};

const CATEGORY_DESCRIPTIONS: Record<MessageCategory, string> = {
  ERROR: "Error messages shown when something goes wrong",
  LOG: "Log messages for server events",
  COMMAND: "Responses to slash commands",
  WELCOME: "Messages shown when members join",
  GOODBYE: "Messages shown when members leave",
  PUNISHMENT: "Messages for warnings, mutes, kicks, and bans",
  PROMOTION: "Messages for rank promotions",
  DEMOTION: "Messages for rank demotions",
  VERIFICATION: "Messages for Roblox verification flow",
  TICKET: "Messages for ticket system",
};

export default function DefaultMessagesPage() {
  const params = useParams<{ serverId: string }>();
  const serverId = params.serverId;
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory | "all">("all");
  const [editingMessage, setEditingMessage] = useState<DefaultMessage | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewMessage, setPreviewMessage] = useState<DefaultMessage | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const defaultMessages = useDefaultMessages(serverId);
  const embeds = useEmbedTemplates(serverId);
  const containers = useContainerTemplates(serverId);
  const texts = useTextTemplates(serverId);

  const updateMessage = useUpdateDefaultMessage(serverId, editingMessage?.id ?? "");

  // Filter by category
  const filteredMessages = selectedCategory === "all"
    ? defaultMessages.data ?? []
    : defaultMessages.data?.filter((m) => m.category === selectedCategory) ?? [];

  // Group by category
  const groupedMessages = filteredMessages.reduce((acc, msg) => {
    if (!acc[msg.category]) acc[msg.category] = [];
    acc[msg.category].push(msg);
    return acc;
  }, {} as Record<MessageCategory, DefaultMessage[]>);

  // Get template for preview
  const getTemplateForMessage = (message: DefaultMessage) => {
    if (message.container_template_id && containers.data) {
      return containers.data.find((t) => t.id === message.container_template_id);
    }
    if (message.embed_template_id && embeds.data) {
      return embeds.data.find((t) => t.id === message.embed_template_id);
    }
    if (message.text_template_id && texts.data) {
      return texts.data.find((t) => t.id === message.text_template_id);
    }
    return null;
  };

  const handleEdit = (message: DefaultMessage) => {
    setEditingMessage(message);
    setEditDialogOpen(true);
  };

  const handlePreview = (message: DefaultMessage) => {
    setPreviewMessage(message);
    setPreviewDialogOpen(true);
  };

  const handleAssignTemplate = async (
    templateType: "text" | "embed" | "container",
    templateId: string | null
  ) => {
    if (!editingMessage) return;

    const updateData: Record<string, string | null | undefined> = {};

    // Clear all template types first
    updateData.text_template_id = null;
    updateData.embed_template_id = null;
    updateData.container_template_id = null;

    // Set the selected template
    if (templateType === "text") {
      updateData.text_template_id = templateId;
    } else if (templateType === "embed") {
      updateData.embed_template_id = templateId;
    } else if (templateType === "container") {
      updateData.container_template_id = templateId;
    }

    updateMessage.mutate(updateData, {
      onSuccess: () => {
        setEditDialogOpen(false);
        setEditingMessage(null);
      },
    });
  };

  const handleClearTemplate = async () => {
    if (!editingMessage) return;

    updateMessage.mutate({
      text_template_id: null,
      embed_template_id: null,
      container_template_id: null,
    }, {
      onSuccess: () => {
        setEditDialogOpen(false);
        setEditingMessage(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Default Messages</h1>
          <p className="text-muted-foreground">
            Customize the default messages used throughout your server.
          </p>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as MessageCategory | "all")} className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All</TabsTrigger>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const Icon = CATEGORY_ICONS[key as MessageCategory];
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4" />
                {label.replace(" Messages", "")}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {defaultMessages.isLoading ? (
            <DefaultMessagesSkeleton />
          ) : Object.keys(groupedMessages).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">No default messages</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                  Default messages are created automatically when you enable features like verification.
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedMessages).map(([category, messages]) => (
              <div key={category} className="space-y-3">
                {selectedCategory === "all" && (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = CATEGORY_ICONS[category as MessageCategory];
                      return <Icon className="h-5 w-5 text-muted-foreground" />;
                    })()}
                    <h2 className="text-lg font-semibold">
                      {CATEGORY_LABELS[category as MessageCategory]}
                    </h2>
                    <Badge variant="secondary" className="font-normal">
                      {messages.length}
                    </Badge>
                  </div>
                )}
                <div className="grid gap-4">
                  {messages.map((message) => {
                    const template = getTemplateForMessage(message);
                    const Icon = CATEGORY_ICONS[message.category];

                    return (
                      <Card key={message.id} className="group relative overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#5865F2]/20">
                                <Icon className="h-5 w-5 text-[#5865F2]" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{message.name}</CardTitle>
                                <CardDescription className="text-xs">
                                  {message.description || DEFAULT_MESSAGE_KEYS[message.category]?.includes(message.key)
                                    ? `Default ${message.key.replace(/_/g, " ")} message`
                                    : message.key}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handlePreview(message)}
                                  disabled={!template && !message.fallback_content}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(message)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </PermissionGate>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3">
                            {message.text_template_id && (
                              <Badge variant="outline" className="gap-1">
                                <FileText className="h-3 w-3" />
                                Text Template
                              </Badge>
                            )}
                            {message.embed_template_id && (
                              <Badge variant="outline" className="gap-1">
                                <Code className="h-3 w-3" />
                                Embed Template
                              </Badge>
                            )}
                            {message.container_template_id && (
                              <Badge variant="outline" className="gap-1">
                                <MessageSquare className="h-3 w-3" />
                                Container Template
                              </Badge>
                            )}
                            {message.fallback_content && !message.text_template_id && !message.embed_template_id && !message.container_template_id && (
                              <Badge variant="secondary">Custom Content</Badge>
                            )}
                            {!message.text_template_id && !message.embed_template_id && !message.container_template_id && !message.fallback_content && (
                              <Badge variant="destructive">No Template Assigned</Badge>
                            )}
                            {message.is_active ? (
                              <Badge variant="default" className="ml-auto bg-green-600">Active</Badge>
                            ) : (
                              <Badge variant="secondary" className="ml-auto">Inactive</Badge>
                            )}
                          </div>
                          {template && (
                            <div className="mt-3 text-xs text-muted-foreground">
                              Template: {template.name}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Default Message</DialogTitle>
            <DialogDescription>
              Assign a template to this default message. The template will be used instead of the built-in message.
            </DialogDescription>
          </DialogHeader>

          {editingMessage && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="font-medium">{editingMessage.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {editingMessage.description || CATEGORY_DESCRIPTIONS[editingMessage.category]}
                </p>
                <Badge variant="outline">{editingMessage.key}</Badge>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Assign Template</h4>
                <p className="text-sm text-muted-foreground">
                  Choose a template type and select from your saved templates.
                </p>

                {/* Text Templates */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Text Template</label>
                  <Select
                    value={editingMessage.text_template_id ?? ""}
                    onValueChange={(v) => handleAssignTemplate("text", v === "none" ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a text template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (clear assignment)</SelectItem>
                      {texts.data?.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Embed Templates */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Embed Template</label>
                  <Select
                    value={editingMessage.embed_template_id ?? ""}
                    onValueChange={(v) => handleAssignTemplate("embed", v === "none" ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an embed template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (clear assignment)</SelectItem>
                      {embeds.data?.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Container Templates */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Container Template (Component V2)</label>
                  <Select
                    value={editingMessage.container_template_id ?? ""}
                    onValueChange={(v) => handleAssignTemplate("container", v === "none" ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a container template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (clear assignment)</SelectItem>
                      {containers.data?.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editingMessage.container_template_id && containers.data && (
                <div className="space-y-2">
                  <h4 className="font-medium">Preview</h4>
                  <div className="rounded-lg border p-4 bg-muted/50">
                    {(() => {
                      const container = containers.data.find((t) => t.id === editingMessage.container_template_id);
                      if (container) {
                        return (
                          <MessagePreview
                            botName="BRM5 Bot"
                            container={{ components: container.template_data?.components as any }}
                            className="max-h-64 overflow-auto"
                          />
                        );
                      }
                      return <p className="text-sm text-muted-foreground">Container not found</p>;
                    })()}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleClearTemplate} disabled={updateMessage.isPending}>
                  Clear All Templates
                </Button>
                <Button onClick={() => setEditDialogOpen(false)} disabled={updateMessage.isPending}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview: {previewMessage?.name}</DialogTitle>
            <DialogDescription>
              Preview how this default message will appear in Discord.
            </DialogDescription>
          </DialogHeader>

          {previewMessage && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-[#313338]">
                {previewMessage.container_template_id && containers.data && (() => {
                  const container = containers.data.find((t) => t.id === previewMessage.container_template_id);
                  if (!container) return null;
                  return (
                    <MessagePreview
                      botName="BRM5 Bot"
                      container={{ components: container.template_data?.components as any }}
                    />
                  );
                })()}
                {previewMessage.embed_template_id && embeds.data && (() => {
                  const embed = embeds.data.find((t) => t.id === previewMessage.embed_template_id);
                  if (!embed) return null;
                  return (
                    <MessagePreview
                      botName="BRM5 Bot"
                      embed={{
                        title: embed.title,
                        description: embed.description,
                        color: embed.color,
                        fields: embed.fields,
                        footer: embed.footer ? { text: embed.footer } : undefined,
                        image: embed.imageUrl ? { url: embed.imageUrl } : undefined,
                        thumbnail: embed.thumbnailUrl ? { url: embed.thumbnailUrl } : undefined,
                        author: embed.authorName ? { name: embed.authorName, iconUrl: embed.authorIconUrl } : undefined,
                      }}
                    />
                  );
                })()}
                {previewMessage.text_template_id && texts.data && (() => {
                  const text = texts.data.find((t) => t.id === previewMessage.text_template_id);
                  if (!text) return null;
                  return (
                    <MessagePreview
                      botName="BRM5 Bot"
                      content={text.content}
                    />
                  );
                })()}
                {previewMessage.fallback_content && !previewMessage.text_template_id && !previewMessage.embed_template_id && !previewMessage.container_template_id && (
                  <MessagePreview
                    botName="BRM5 Bot"
                    content={previewMessage.fallback_content}
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DefaultMessagesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-60" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}