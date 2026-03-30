'use client';

import Link from 'next/link';
import { MoreVertical, Edit, Trash2, Lock, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFolderIcon } from '@/lib/folder-icons';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ContentFolder } from '@/types/content-folder';

interface FolderCardProps {
  folder: ContentFolder;
  serverId: string;
  onEdit?: (folder: ContentFolder) => void;
  onDelete?: (folder: ContentFolder) => void;
  showActions?: boolean;
}

/**
 * FolderCard displays a content folder in a grid view with:
 * - Folder icon (default or custom)
 * - Name and description
 * - Item count badge
 * - Visibility badge (private/public)
 * - Color indicator (left border)
 * - Hover actions for edit and delete
 */
export function FolderCard({
  folder,
  serverId,
  onEdit,
  onDelete,
  showActions = true,
}: FolderCardProps) {
  const itemCount = folder.items?.length ?? 0;
  const isPrivate = folder.visibility === 'private';

  return (
    <Card
      className="group border-l-4 transition-all hover:bg-accent/30 hover:shadow-md"
      style={{ borderLeftColor: folder.color || '#5865F2' }}
    >
      <div className="flex flex-col p-4">
        {/* Header row: Icon + Name + Actions */}
        <div className="flex items-start gap-3">
          {/* Folder Icon */}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `${folder.color || '#5865F2'}20`,
            }}
          >
            {(() => {
              const IconComponent = getFolderIcon(folder.icon);
              return (
                <IconComponent
                  className="h-5 w-5"
                  style={{ color: folder.color || '#5865F2' }}
                />
              );
            })()}
          </div>

          {/* Name and Description */}
          <div className="min-w-0 flex-1">
            <Link
              href={`/server/${serverId}/saved-content/folders/${folder.id}`}
              className="block"
            >
              <h3 className="truncate font-semibold text-foreground hover:text-primary hover:underline">
                {folder.name}
              </h3>
            </Link>
            {folder.description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {folder.description}
              </p>
            )}
          </div>

          {/* Actions dropdown */}
          {showActions && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Folder actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 bg-[#2B2D31] border-[#3F4147]"
              >
                {onEdit && (
                  <DropdownMenuItem
                    onClick={() => onEdit(folder)}
                    className="text-[#DBDEE1] hover:bg-[#35373C] focus:bg-[#35373C] cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit folder
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(folder)}
                    className="text-destructive focus:text-destructive hover:bg-[#35373C] focus:bg-[#35373C] cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete folder
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Footer row: Badges */}
        <div className="mt-3 flex items-center gap-2">
          {/* Item count badge */}
          <Badge variant="secondary" className="gap-1 text-xs">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Badge>

          {/* Visibility badge */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="gap-1 text-xs"
                >
                  {isPrivate ? (
                    <>
                      <Lock className="h-3 w-3" />
                      Private
                    </>
                  ) : (
                    <>
                      <Globe className="h-3 w-3" />
                      Public
                    </>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {isPrivate
                  ? 'Only visible to you and server admins'
                  : 'Visible to all server members'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Download count (if > 0) */}
          {(folder.download_count ?? 0) > 0 && (
            <Badge variant="outline" className="text-xs">
              {folder.download_count ?? 0} downloads
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}