'use client';

import { useState, useMemo } from 'react';
import { Folder, FileText, Layout, Code, Layers } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getFolderIcon } from '@/lib/folder-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContentFolders, useMoveContentFolderItem } from '@/hooks/use-content-folders';
import type { ContentFolder, ContentFolderItem, ContentItemType } from '@/types/content-folder';

interface MoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
  item: ContentFolderItem | null;
  currentFolderId: string;
  onSuccess?: () => void;
}

const ITEM_TYPE_LABELS: Record<ContentItemType, string> = {
  EMBED: 'Embed',
  CONTAINER: 'Container',
  TEXT: 'Text Template',
  MODAL: 'Modal',
  AUTOMATION: 'Automation',
};

const ITEM_TYPE_ICONS: Record<ContentItemType, React.ElementType> = {
  EMBED: Code,
  CONTAINER: Layers,
  TEXT: FileText,
  MODAL: Layout,
  AUTOMATION: Layers,
};

/**
 * Recursively builds a flat list of folders with depth indentation info.
 */
function flattenFolders(
  folders: ContentFolder[] | undefined,
  depth = 0
): { folder: ContentFolder; depth: number }[] {
  if (!folders) return [];

  const result: { folder: ContentFolder; depth: number }[] = [];

  for (const folder of folders) {
    result.push({ folder, depth });
    if (folder.children && folder.children.length > 0) {
      result.push(...flattenFolders(folder.children, depth + 1));
    }
  }

  return result;
}

/**
 * MoveItemDialog displays a dialog for moving a content item between folders.
 *
 * Features:
 * - Shows the current item being moved (type and ID)
 * - Dropdown to select target folder, grouped by hierarchy
 * - Loading state during move operation
 * - Disabled when no target is selected or target equals current folder
 */
export function MoveItemDialog({
  open,
  onOpenChange,
  serverId,
  item,
  currentFolderId,
  onSuccess,
}: MoveItemDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');

  // Fetch all folders for the server
  const { data: folders, isLoading: isLoadingFolders } = useContentFolders(serverId);

  // Move mutation
  const moveMutation = useMoveContentFolderItem(serverId);

  // Flatten folder tree for select dropdown with depth info
  const folderOptions = useMemo(() => {
    if (!folders) return [];
    return flattenFolders(folders);
  }, [folders]);

  // Handle move
  const handleMove = () => {
    if (!item || !selectedFolderId || selectedFolderId === currentFolderId) return;

    moveMutation.mutate(
      {
        item_id: item.item_id,
        item_type: item.item_type,
        source_folder_id: currentFolderId,
        target_folder_id: selectedFolderId,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedFolderId('');
          onSuccess?.();
        },
      }
    );
  };

  // Reset selection when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedFolderId('');
    }
    onOpenChange(newOpen);
  };

  // Get item type display info
  const ItemTypeIcon = item ? ITEM_TYPE_ICONS[item.item_type] : FileText;
  const itemTypeName = item ? ITEM_TYPE_LABELS[item.item_type] : 'Item';

  const canMove =
    item &&
    selectedFolderId &&
    selectedFolderId !== currentFolderId &&
    !moveMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#2B2D31] border-[#3F4147] text-[#DBDEE1]">
        <DialogHeader>
          <DialogTitle>Move Item</DialogTitle>
          <DialogDescription className="text-[#949BA4]">
            Select a destination folder for this item.
          </DialogDescription>
        </DialogHeader>

        {/* Current item info */}
        {item && (
          <div className="flex items-center gap-3 rounded-lg bg-[#35373C] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#5865F2]/20">
              <ItemTypeIcon className="h-5 w-5 text-[#5865F2]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#DBDEE1]">{itemTypeName}</p>
              <p className="truncate text-xs text-[#949BA4]">ID: {item.item_id}</p>
            </div>
          </div>
        )}

        {/* Folder selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#DBDEE1]">Destination Folder</label>
          <Select
            value={selectedFolderId}
            onValueChange={setSelectedFolderId}
            disabled={isLoadingFolders || moveMutation.isPending}
          >
            <SelectTrigger className="bg-[#1E1F22] border-[#3F4147] text-[#DBDEE1]">
              <SelectValue placeholder="Select a folder..." />
            </SelectTrigger>
            <SelectContent className="bg-[#2B2D31] border-[#3F4147]">
              {isLoadingFolders ? (
                <SelectItem value="__loading" disabled>
                  Loading folders...
                </SelectItem>
              ) : folderOptions.length === 0 ? (
                <SelectItem value="__empty" disabled>
                  No folders available
                </SelectItem>
              ) : (
                folderOptions.map(({ folder, depth }) => {
                  const isCurrentFolder = folder.id === currentFolderId;
                  const indent = depth * 16;

                  return (
                    <SelectItem
                      key={folder.id}
                      value={folder.id}
                      disabled={isCurrentFolder}
                      className="text-[#DBDEE1] hover:bg-[#35373C] focus:bg-[#35373C] cursor-pointer"
                    >
                      <div
                        className="flex items-center gap-2"
                        style={{ paddingLeft: indent }}
                      >
                        {(() => {
                          const IconComponent = getFolderIcon(folder.icon);
                          return <IconComponent className="h-4 w-4 text-[#5865F2]" />;
                        })()}
                        <span className="truncate">{folder.name}</span>
                        {isCurrentFolder && (
                          <span className="text-xs text-[#949BA4]">(current)</span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>

          {/* Show warning if same folder selected */}
          {selectedFolderId === currentFolderId && (
            <p className="text-xs text-amber-500">
              This item is already in the selected folder.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={moveMutation.isPending}
            className="text-[#949BA4] hover:text-[#DBDEE1] hover:bg-[#35373C]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={!canMove}
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
          >
            {moveMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Moving...
              </span>
            ) : (
              'Move'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}