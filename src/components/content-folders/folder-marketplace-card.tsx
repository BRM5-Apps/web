'use client';

import { Download, Eye, Star } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RatingDisplay } from './rating-input';
import { getFolderIcon } from '@/lib/folder-icons';
import type { PublicContentFolder } from '@/types/content-folder';

interface FolderMarketplaceCardProps {
  folder: PublicContentFolder;
  onImport?: (folder: PublicContentFolder) => void;
  onView?: (folder: PublicContentFolder) => void;
}

/**
 * FolderMarketplaceCard - Card for displaying public folders in marketplace
 *
 * Shows:
 * - Folder icon (default or custom) with color
 * - Name and description
 * - Author info
 * - Download count
 * - Average rating (stars)
 * - View and Import action buttons
 */
export function FolderMarketplaceCard({
  folder,
  onImport,
  onView,
}: FolderMarketplaceCardProps) {
  const author = folder.author;
  const averageRating = folder.average_rating ?? 0;
  const ratingCount = folder.rating_count ?? 0;

  return (
    <Card className="group relative overflow-hidden border-l-4 transition-all hover:bg-accent/30 hover:shadow-md">
      {/* Color indicator */}
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: folder.color || '#5865F2' }}
      />

      <CardHeader className="pb-2">
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

          {/* Title and Description */}
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="truncate font-semibold text-foreground">
              {folder.name}
            </h3>
            {folder.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {folder.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Author */}
        {author && (
          <div className="flex items-center gap-2">
            {author.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.username}
                className="h-5 w-5 rounded-full"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                <span className="text-[10px] font-medium text-muted-foreground">
                  {author.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              by <span className="font-medium text-foreground">{author.username}</span>
            </span>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-4">
          {/* Rating */}
          {ratingCount > 0 ? (
            <RatingDisplay
              value={averageRating}
              count={ratingCount}
              showValue
              size="sm"
            />
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5" />
              No ratings
            </span>
          )}

          {/* Download Count */}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Download className="h-3.5 w-3.5" />
            {folder.download_count.toLocaleString()}
          </span>
        </div>

        {/* Item Count */}
        {folder.items && folder.items.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {folder.items.length} {folder.items.length === 1 ? 'item' : 'items'}
          </Badge>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView?.(folder)}
          className="flex-1"
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          View
        </Button>
        <Button
          size="sm"
          onClick={() => onImport?.(folder)}
          className="flex-1"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Import
        </Button>
      </CardFooter>
    </Card>
  );
}