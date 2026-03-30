"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  useContentFolder,
  useContentFolderItems,
  useDeleteContentFolder,
  useRemoveItemFromFolder,
  useAddContentFolderItem,
} from "@/hooks/use-content-folders";
import { useEmbedTemplates, useContainerTemplates, useTextTemplates, useModalTemplates } from "@/hooks/use-templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmbedPreview } from "@/components/discord-preview/embed-preview";
import { ContainerPreview } from "@/components/discord-preview/container-preview";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Loading } from "@/components/shared/loading";
import { PERMISSION_KEYS } from "@/lib/constants";
import { formatDate, truncateText } from "@/lib/utils";
import type { ContentFolderItem, ContentItemType } from "@/types/content-folder";
import type { EmbedTemplate, ContainerTemplate, TextTemplate, ModalTemplate } from "@/types/template";
import {
  ArrowLeft,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  Plus,
  FileText,
  Layout,
  Layers,
  LayoutTemplate,
  GripVertical,
  FolderOpen,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ResolvedItem = {
  item: ContentFolderItem;
  content: EmbedTemplate | ContainerTemplate | TextTemplate | ModalTemplate | null;
  type: ContentItemType;
};

// ─── Icon Mapping ──────────────────────────────────────────────────────────────

const typeIcons: Record<ContentItemType, React.ComponentType<{ className?: string }>> = {
  EMBED: Layout,
  CONTAINER: Layers,
  TEXT: FileText,
  MODAL: LayoutTemplate,
  AUTOMATION: GripVertical, // Placeholder
};

const typeLabels: Record<ContentItemType, string> = {
  EMBED: "Embed",
  CONTAINER: "Container",
  TEXT: "Text",
  MODAL: "Modal",
  AUTOMATION: "Automation",
};

// ─── Skeletons ─────────────────────────────────────────────────────────────────

function FolderHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}

function ItemsGridSkeleton() {
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

// ─── Item Card ─────────────────────────────────────────────────────────────────

interface ItemCardProps {
  item: ResolvedItem;
  serverId: string;
  onRemove: () => void;
  isRemoving: boolean;
}

function ItemCard({ item, serverId, onRemove, isRemoving }: ItemCardProps) {
  const Icon = typeIcons[item.type];

  if (!item.content) {
    return (
      <Card className="relative overflow-hidden p-4 opacity-60">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span className="truncate">Item not found</span>
        </div>
      </Card>
    );
  }

  const content = item.content;
  const name = "name" in content ? content.name : "Untitled";
  const createdAt = "createdAt" in content ? content.createdAt : "";

  // Render based on content type
  const renderPreview = () => {
    switch (item.type) {
      case "EMBED":
        const embed = content as EmbedTemplate;
        return (
          <EmbedPreview
            title={embed.title}
            description={embed.description}
            color={embed.color}
            fields={embed.fields}
            footer={{ text: embed.footer ?? "" }}
            image={{ url: embed.imageUrl ?? "" }}
            thumbnail={{ url: embed.thumbnailUrl ?? "" }}
            author={{ name: embed.authorName ?? "" }}
            className="pointer-events-none"
          />
        );
      case "CONTAINER":
        return <ContainerPreview components={(content as ContainerTemplate).template_data?.components as any} />;
      case "TEXT":
        return (
          <div className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
            {truncateText((content as TextTemplate).content, 160)}
          </div>
        );
      case "MODAL":
        const modal = content as ModalTemplate;
        const pages = modal.template_data?.pages as any[] | undefined;
        const fieldCount = pages?.flatMap((p) => p.components ?? []).length ?? 0;
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              {pages?.length ?? 0} page(s) | {fieldCount} field(s)
            </div>
            {modal.settings && (
              <Badge variant="outline" className="text-xs">
                Has action flow
              </Badge>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="group relative overflow-hidden p-4">
      {/* Hover actions */}
      <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Item actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-[#2B2D31] border-[#3F4147]">
              <DropdownMenuItem asChild className="text-[#DBDEE1] hover:bg-[#35373C] focus:bg-[#35373C] cursor-pointer">
                <Link href={getEditHref(item.type, content.id, serverId)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#3F4147]" />
              <DropdownMenuItem
                onClick={onRemove}
                disabled={isRemoving}
                className="text-destructive focus:text-destructive hover:bg-[#35373C] focus:bg-[#35373C] cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove from folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </PermissionGate>
      </div>

      {/* Header */}
      <div className="mb-3 flex items-center justify-between pr-10">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="truncate font-medium">{name}</span>
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {typeLabels[item.type]} | Created {formatDate(createdAt)}
          </div>
        </div>
      </div>

      {/* Preview */}
      {renderPreview()}
    </Card>
  );
}

function getEditHref(type: ContentItemType, itemId: string, serverId: string): string {
  switch (type) {
    case "EMBED":
      return `/server/${serverId}/message-builder?type=embed&id=${itemId}`;
    case "CONTAINER":
      return `/server/${serverId}/message-builder?type=container&id=${itemId}`;
    case "TEXT":
      return `/server/${serverId}/message-builder?type=text&id=${itemId}`;
    case "MODAL":
      return `/server/${serverId}/modal-builder/${itemId}`;
    default:
      return `/server/${serverId}/saved-content`;
  }
}

// ─── Add Content Dialog ─────────────────────────────────────────────────────────

interface AddContentDialogProps {
  serverId: string;
  folderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddContentDialog({ serverId, folderId, open, onOpenChange }: AddContentDialogProps) {
  const [selectedType, setSelectedType] = useState<ContentItemType | "">("");
  const [selectedItemId, setSelectedItemId] = useState("");

  // Fetch templates
  const embeds = useEmbedTemplates(serverId);
  const containers = useContainerTemplates(serverId);
  const texts = useTextTemplates(serverId);
  const modals = useModalTemplates(serverId);

  // Mutation to add item to folder
  const addFolderItem = useAddContentFolderItem(serverId, folderId);

  // Get the appropriate list based on type
  const getAvailableItems = () => {
    switch (selectedType) {
      case "EMBED":
        return embeds.data ?? [];
      case "CONTAINER":
        return containers.data ?? [];
      case "TEXT":
        return texts.data ?? [];
      case "MODAL":
        return modals.data ?? [];
      default:
        return [];
    }
  };

  const items = getAvailableItems();
  const isLoading = embeds.isLoading || containers.isLoading || texts.isLoading || modals.isLoading;

  const handleAddItem = () => {
    if (!selectedType || !selectedItemId) return;

    addFolderItem.mutate(
      { item_type: selectedType, item_id: selectedItemId },
      {
        onSuccess: () => {
          setSelectedType("");
          setSelectedItemId("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#313338] border-[#3F4147]">
        <DialogHeader>
          <DialogTitle>Add Content to Folder</DialogTitle>
          <DialogDescription className="text-[#B5BAC1]">
            Select a content type and choose an item to add.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Content Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#DBDEE1]">Content Type</label>
            <Select value={selectedType} onValueChange={(v) => { setSelectedType(v as ContentItemType); setSelectedItemId(""); }}>
              <SelectTrigger className="bg-[#1E1F22] border-[#3F4147] text-[#DBDEE1]">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent className="bg-[#2B2D31] border-[#3F4147]">
                <SelectItem value="EMBED">Embed</SelectItem>
                <SelectItem value="CONTAINER">Container</SelectItem>
                <SelectItem value="TEXT">Text</SelectItem>
                <SelectItem value="MODAL">Modal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Item Selector */}
          {selectedType && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#DBDEE1]">Select Item</label>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No {typeLabels[selectedType as ContentItemType].toLowerCase()}s available.
                </p>
              ) : (
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger className="bg-[#1E1F22] border-[#3F4147] text-[#DBDEE1]">
                    <SelectValue placeholder={`Select a ${typeLabels[selectedType as ContentItemType].toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2B2D31] border-[#3F4147] max-h-60">
                    {items.map((item: any) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!selectedType || !selectedItemId}
            onClick={handleAddItem}
          >
            {addFolderItem.isPending ? "Adding..." : "Add to Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyFolderState({ onAddContent }: { onAddContent: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <FolderOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">This folder is empty</h3>
      <p className="mb-6 max-w-sm text-muted-foreground">
        Add embeds, containers, text messages, or modals to organize your saved content.
      </p>
      <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
        <Button onClick={onAddContent}>
          <Plus className="mr-2 h-4 w-4" />
          Add Content
        </Button>
      </PermissionGate>
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────────

export default function FolderDetailPage() {
  const { serverId, folderId } = useParams<{ serverId: string; folderId: string }>();
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<ContentFolderItem | null>(null);

  // Fetch folder data
  const { data: folder, isLoading: isFolderLoading } = useContentFolder(serverId, folderId);
  const { data: items, isLoading: isItemsLoading } = useContentFolderItems(serverId, folderId);

  // Fetch templates to resolve items
  const embeds = useEmbedTemplates(serverId);
  const containers = useContainerTemplates(serverId);
  const texts = useTextTemplates(serverId);
  const modals = useModalTemplates(serverId);

  // Mutations
  const deleteFolder = useDeleteContentFolder(serverId);
  const removeItem = useRemoveItemFromFolder(serverId, folderId);

  // Resolve items to actual content
  const resolvedItems: ResolvedItem[] = (items ?? []).map((item) => {
    let content: EmbedTemplate | ContainerTemplate | TextTemplate | ModalTemplate | null = null;

    switch (item.item_type) {
      case "EMBED":
        content = embeds.data?.find((e) => e.id === item.item_id) ?? null;
        break;
      case "CONTAINER":
        content = containers.data?.find((c) => c.id === item.item_id) ?? null;
        break;
      case "TEXT":
        content = texts.data?.find((t) => t.id === item.item_id) ?? null;
        break;
      case "MODAL":
        content = modals.data?.find((m) => m.id === item.item_id) ?? null;
        break;
    }

    return { item, content, type: item.item_type };
  });

  const isLoadingAny =
    isFolderLoading ||
    isItemsLoading ||
    embeds.isLoading ||
    containers.isLoading ||
    texts.isLoading ||
    modals.isLoading;

  // Handlers
  const handleDeleteFolder = () => {
    if (confirm("Are you sure you want to delete this folder? Items inside will not be deleted.")) {
      deleteFolder.mutate(folderId, {
        onSuccess: () => {
          router.push(`/server/${serverId}/saved-content`);
        },
      });
    }
  };

  const handleRemoveItem = () => {
    if (!itemToRemove) return;
    removeItem.mutate(
      { itemId: itemToRemove.item_id, itemType: itemToRemove.item_type },
      { onSettled: () => setItemToRemove(null) }
    );
  };

  // Loading state
  if (isLoadingAny && !folder) {
    return (
      <div className="space-y-6 p-6">
        <FolderHeaderSkeleton />
        <ItemsGridSkeleton />
      </div>
    );
  }

  // Not found state
  if (!folder) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Folder not found</h2>
        <p className="mb-6 text-muted-foreground">
          This folder may have been deleted or you don&apos;t have access to it.
        </p>
        <Button variant="outline" asChild>
          <Link href={`/server/${serverId}/saved-content`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Saved Content
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/server/${serverId}/saved-content`}
          className="flex items-center gap-1.5 text-[#b5bac1] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Saved Content
        </Link>
        <span className="text-[#3f4147]">/</span>
        <h1 className="font-semibold text-[#f1f1f2]">{folder.name}</h1>
      </div>

      {/* Folder Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {folder.icon && <span className="text-2xl">{folder.icon}</span>}
            <h1 className="text-2xl font-bold tracking-tight">{folder.name}</h1>
            {folder.visibility === "private" ? (
              <Badge variant="outline" className="gap-1">
                Private
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                Public
              </Badge>
            )}
          </div>
          {folder.description && (
            <p className="mt-1 text-muted-foreground">{folder.description}</p>
          )}
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{resolvedItems.length} items</span>
            {folder.download_count > 0 && <span>{folder.download_count} downloads</span>}
            <span>Created {formatDate(folder.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <PermissionGate permission={PERMISSION_KEYS.TEMPLATES_MANAGE}>
            <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Content
            </Button>
          </PermissionGate>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Folder actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-[#2B2D31] border-[#3F4147]">
              <DropdownMenuItem className="text-[#DBDEE1] hover:bg-[#35373C] focus:bg-[#35373C] cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit folder
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[#DBDEE1] hover:bg-[#35373C] focus:bg-[#35373C] cursor-pointer">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#3F4147]" />
              <DropdownMenuItem
                onClick={handleDeleteFolder}
                className="text-destructive focus:text-destructive hover:bg-[#35373C] focus:bg-[#35373C] cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Items Grid */}
      {resolvedItems.length === 0 && !isLoadingAny ? (
        <EmptyFolderState onAddContent={() => setAddDialogOpen(true)} />
      ) : isLoadingAny ? (
        <ItemsGridSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resolvedItems.map((resolved) => (
            <ItemCard
              key={`${resolved.item.item_type}-${resolved.item.item_id}`}
              item={resolved}
              serverId={serverId}
              onRemove={() => {
                setItemToRemove(resolved.item);
                removeItem.mutate(
                  { itemId: resolved.item.item_id, itemType: resolved.item.item_type },
                  { onSettled: () => setItemToRemove(null) }
                );
              }}
              isRemoving={removeItem.isPending && itemToRemove?.item_id === resolved.item.item_id}
            />
          ))}
        </div>
      )}

      {/* Add Content Dialog */}
      <AddContentDialog
        serverId={serverId}
        folderId={folderId}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </div>
  );
}