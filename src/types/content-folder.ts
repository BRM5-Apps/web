/**
 * Content Folder Types
 *
 * Types for content organization folders that can contain templates,
 * modals, automations, and other shareable content.
 */

export type ContentItemType = 'EMBED' | 'CONTAINER' | 'TEXT' | 'MODAL' | 'AUTOMATION';

export type ContentFolderVisibility = 'private' | 'public';

export interface ContentFolder {
  id: string;
  server_id: string;
  parent_id?: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  visibility: ContentFolderVisibility;
  sort_order: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  children?: ContentFolder[];
  items?: ContentFolderItem[];
}

export interface ContentFolderItem {
  id: string;
  folder_id: string;
  item_type: ContentItemType;
  item_id: string;
  added_at: string;
  added_by?: string;
}

export interface ContentFolderRating {
  id: string;
  folder_id: string;
  user_id: string;
  rating: number;
  review?: string;
  created_at: string;
  user?: { id: string; username: string; avatar_url?: string };
}

// Request DTOs
export interface CreateContentFolderRequest {
  name: string;
  parent_id?: string;
  description?: string;
  icon?: string;
  color?: string;
  visibility?: ContentFolderVisibility;
}

export interface UpdateContentFolderRequest {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  visibility?: ContentFolderVisibility;
  sort_order?: number;
}

export interface AddItemToFolderRequest {
  item_type: ContentItemType;
  item_id: string;
}

export interface CreateContentFolderRatingRequest {
  rating: number;
  review?: string;
}

export interface MoveContentFolderItemRequest {
  item_id: string;
  item_type: ContentItemType;
  source_folder_id: string;
  target_folder_id: string;
}

export interface ContentFolderImport {
  id: string;
  server_id: string;
  folder_id: string;
  imported_by: string;
  imported_at: string;
  folder?: ContentFolder;
}

// Response types
export interface ContentFolderStats {
  average_rating: number;
  rating_count: number;
}

export interface ContentFolderContents {
  folder: ContentFolder;
  items: ContentFolderItem[];
  resolved_content?: {
    embeds?: unknown[];
    containers?: unknown[];
    texts?: unknown[];
    modals?: unknown[];
    automations?: unknown[];
  };
}

// List filters
export interface ContentFolderFilters {
  parent_id?: string;
  visibility?: ContentFolderVisibility;
  search?: string;
}

// Content type labels for display
export const CONTENT_ITEM_TYPE_LABELS: Record<ContentItemType, string> = {
  EMBED: 'Embed',
  CONTAINER: 'Container',
  TEXT: 'Text',
  MODAL: 'Modal',
  AUTOMATION: 'Automation',
};

// Content type icons for display (lucide icon names)
export const CONTENT_ITEM_TYPE_ICONS: Record<ContentItemType, string> = {
  EMBED: 'file-code-2',
  CONTAINER: 'box',
  TEXT: 'file-text',
  MODAL: 'layout',
  AUTOMATION: 'zap',
};

// Marketplace-specific folder type with additional fields for public display
export interface PublicContentFolder extends ContentFolder {
  average_rating?: number;
  rating_count?: number;
  author?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}