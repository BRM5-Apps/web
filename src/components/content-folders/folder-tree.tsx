'use client';

import { useState, useCallback } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getFolderIcon } from '@/lib/folder-icons';
import type { ContentFolder } from '@/types/content-folder';

interface FolderTreeProps {
  folders: ContentFolder[];
  selectedFolderId?: string;
  onSelect: (folder: ContentFolder) => void;
  onCreateFolder?: () => void;
  className?: string;
}

interface FolderItemProps {
  folder: ContentFolder;
  level: number;
  selectedFolderId?: string;
  onSelect: (folder: ContentFolder) => void;
  expandedIds: Set<string>;
  onToggleExpand: (folderId: string) => void;
}

/**
 * FolderTree displays folders in a hierarchical tree structure with:
 * - Recursive rendering of nested folders
 * - Expand/collapse for folders with children
 * - Folder icons (closed when collapsed, open when expanded)
 * - Selection highlighting
 * - Create folder button at bottom
 */
export function FolderTree({
  folders,
  selectedFolderId,
  onSelect,
  onCreateFolder,
  className,
}: FolderTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Auto-expand folders that contain the selected folder
    const expanded = new Set<string>();
    if (selectedFolderId) {
      findParentFolders(folders, selectedFolderId, expanded);
    }
    return expanded;
  });

  const handleToggleExpand = useCallback((folderId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  // Build tree from flat list
  const rootFolders = buildFolderTree(folders);

  if (folders.length === 0) {
    return (
      <div className={cn('flex flex-col gap-2 p-4', className)}>
        <div className="text-center text-sm text-muted-foreground py-6">
          No folders yet
        </div>
        {onCreateFolder && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateFolder}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Folder
          </Button>
        )}
      </div>
    );
  }

  return (
    <ScrollArea className={cn('flex-1', className)}>
      <div className="flex flex-col gap-0.5 p-2">
        {rootFolders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            level={0}
            selectedFolderId={selectedFolderId}
            onSelect={onSelect}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
          />
        ))}

        {onCreateFolder && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateFolder}
            className="mt-2 w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Create Folder
          </Button>
        )}
      </div>
    </ScrollArea>
  );
}

/**
 * FolderItem renders a single folder and recursively renders its children
 */
function FolderItem({
  folder,
  level,
  selectedFolderId,
  onSelect,
  expandedIds,
  onToggleExpand,
}: FolderItemProps) {
  const hasChildren = folder.children && folder.children.length > 0;
  const isExpanded = expandedIds.has(folder.id);
  const isSelected = selectedFolderId === folder.id;

  const handleClick = () => {
    onSelect(folder);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(folder.id);
  };

  return (
    <div className="flex flex-col">
      {/* Folder row */}
      <div
        className={cn(
          'group flex items-center gap-1.5 rounded-[4px] px-2 py-1.5 cursor-pointer transition-colors',
          'hover:bg-[#35373C]',
          isSelected && 'bg-[#404249] text-[#F1F1F2]',
          isSelected && 'border-l-2 border-[#5865F2]'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-[#3F4147]"
            aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="h-4 w-4" /> // Spacer for alignment
        )}

        {/* Folder icon */}
        <div
          className="flex h-5 w-5 shrink-0 items-center justify-center"
          style={{ color: folder.color || '#5865F2' }}
        >
          {(() => {
            const IconComponent = getFolderIcon(folder.icon);
            // If custom icon, use it; otherwise use Folder/FolderOpen based on state
            if (folder.icon) {
              return <IconComponent className="h-4 w-4" />;
            }
            if (isExpanded && hasChildren) {
              return <FolderOpen className="h-4 w-4" />;
            }
            return <Folder className="h-4 w-4" />;
          })()}
        </div>

        {/* Folder name */}
        <span className={cn(
          'truncate text-sm',
          isSelected ? 'font-medium text-foreground' : 'text-[#949BA4] group-hover:text-[#F1F1F2]'
        )}>
          {folder.name}
        </span>

        {/* Item count badge */}
        {folder.items && folder.items.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {folder.items.length}
          </span>
        )}
      </div>

      {/* Children (rendered when expanded) */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col">
          {folder.children!.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Build a tree structure from a flat list of folders
 */
function buildFolderTree(folders: ContentFolder[]): ContentFolder[] {
  const folderMap = new Map<string, ContentFolder>();
  const rootFolders: ContentFolder[] = [];

  // First pass: create map of all folders
  for (const folder of folders) {
    folderMap.set(folder.id, { ...folder, children: [] });
  }

  // Second pass: build tree
  for (const folder of folders) {
    const node = folderMap.get(folder.id)!;
    if (folder.parent_id) {
      const parent = folderMap.get(folder.parent_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        // Orphan folder - add to root
        rootFolders.push(node);
      }
    } else {
      rootFolders.push(node);
    }
  }

  // Sort by sort_order
  const sortByOrder = (a: ContentFolder, b: ContentFolder) =>
    a.sort_order - b.sort_order;

  const sortChildren = (items: ContentFolder[]): ContentFolder[] => {
    return items.sort(sortByOrder).map((item) => ({
      ...item,
      children: item.children ? sortChildren(item.children) : [],
    }));
  };

  return sortChildren(rootFolders);
}

/**
 * Find all parent folders of a given folder ID
 */
function findParentFolders(
  folders: ContentFolder[],
  targetId: string,
  result: Set<string>
): void {
  const folderMap = new Map<string, ContentFolder>();
  for (const folder of folders) {
    folderMap.set(folder.id, folder);
  }

  let current = folderMap.get(targetId);
  while (current?.parent_id) {
    result.add(current.parent_id);
    current = folderMap.get(current.parent_id);
  }
}