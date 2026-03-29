"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type {
  ContentFolder,
  ContentFolderItem,
  ContentFolderRating,
  CreateContentFolderRequest,
  UpdateContentFolderRequest,
  AddItemToFolderRequest,
  MoveContentFolderItemRequest,
  CreateContentFolderRatingRequest,
} from "@/types/content-folder";
import type { ApiError } from "@/types/api";

// ═════════════════════════════════════════════════════════════════════════════
// Server-Scoped Folder Queries
// ═════════════════════════════════════════════════════════════════════════════

/**
 * List all content folders for a server, optionally filtered by parent folder.
 */
export function useContentFolders(serverId: string, parentId?: string) {
  return useQuery({
    queryKey: queryKeys.contentFolders.list(serverId, parentId),
    queryFn: () => api.contentFolders.list(serverId, parentId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: Boolean(serverId),
  });
}

/**
 * Get a single content folder by ID.
 */
export function useContentFolder(serverId: string, folderId: string) {
  return useQuery({
    queryKey: queryKeys.contentFolders.detail(serverId, folderId),
    queryFn: () => api.contentFolders.get(serverId, folderId),
    enabled: Boolean(serverId) && Boolean(folderId),
  });
}

/**
 * Get all items in a content folder.
 */
export function useContentFolderItems(serverId: string, folderId: string) {
  return useQuery({
    queryKey: queryKeys.contentFolders.items(serverId, folderId),
    queryFn: () => api.contentFolders.getItems(serverId, folderId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: Boolean(serverId) && Boolean(folderId),
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Folder Mutations
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Create a new content folder.
 */
export function useCreateContentFolder(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContentFolderRequest) =>
      api.contentFolders.create(serverId, data),
    onSuccess: (created) => {
      // Invalidate all folder queries for this server
      queryClient.invalidateQueries({
        queryKey: ["servers", serverId, "content-folders"],
      });
      queryClient.setQueryData(
        queryKeys.contentFolders.detail(serverId, created.id),
        created
      );
    },
    onError: (err: unknown) => {
      toast.error(
        typeof err === "object" && err && "message" in err
          ? (err as ApiError).message
          : "Failed to create folder"
      );
    },
  });
}

/**
 * Update an existing content folder.
 */
export function useUpdateContentFolder(serverId: string, folderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateContentFolderRequest) =>
      api.contentFolders.update(serverId, folderId, data),
    onSuccess: (updated) => {
      // Invalidate all folder queries for this server
      queryClient.invalidateQueries({
        queryKey: ["servers", serverId, "content-folders"],
      });
      queryClient.setQueryData(
        queryKeys.contentFolders.detail(serverId, folderId),
        updated
      );
    },
    onError: (err: unknown) => {
      toast.error(
        typeof err === "object" && err && "message" in err
          ? (err as ApiError).message
          : "Failed to save folder"
      );
    },
  });
}

/**
 * Delete a content folder.
 */
export function useDeleteContentFolder(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) =>
      api.contentFolders.delete(serverId, folderId),
    onSuccess: (_res, folderId) => {
      // Invalidate all folder queries for this server
      queryClient.invalidateQueries({
        queryKey: ["servers", serverId, "content-folders"],
      });
      queryClient.removeQueries({
        queryKey: queryKeys.contentFolders.detail(serverId, folderId),
      });
    },
    onError: () => toast.error("Failed to delete folder"),
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Folder Item Mutations
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Add an item to a content folder.
 */
export function useAddContentFolderItem(serverId: string, folderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddItemToFolderRequest) =>
      api.contentFolders.addItem(serverId, folderId, data),
    onSuccess: () => {
      toast.success("Item added to folder");
      queryClient.invalidateQueries({
        queryKey: queryKeys.contentFolders.items(serverId, folderId),
      });
    },
    onError: (err: unknown) => {
      toast.error(
        typeof err === "object" && err && "message" in err
          ? (err as ApiError).message
          : "Failed to add item to folder"
      );
    },
  });
}

/**
 * Remove an item from a content folder.
 */
export function useRemoveContentFolderItem(serverId: string, folderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, itemType }: { itemId: string; itemType: string }) =>
      api.contentFolders.removeItem(serverId, folderId, itemId, itemType),
    onSuccess: () => {
      toast.success("Item removed from folder");
      queryClient.invalidateQueries({
        queryKey: queryKeys.contentFolders.items(serverId, folderId),
      });
    },
    onError: () => toast.error("Failed to remove item from folder"),
  });
}

/**
 * Move an item between content folders.
 */
export function useMoveContentFolderItem(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MoveContentFolderItemRequest) =>
      api.contentFolders.moveItem(serverId, data),
    onSuccess: (_, data) => {
      toast.success("Item moved successfully");
      // Invalidate both source and target folder items
      queryClient.invalidateQueries({
        queryKey: queryKeys.contentFolders.items(serverId, data.source_folder_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.contentFolders.items(serverId, data.target_folder_id),
      });
    },
    onError: () => toast.error("Failed to move item"),
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Public Marketplace Queries
// ═════════════════════════════════════════════════════════════════════════════

/**
 * List public content folders from the marketplace.
 */
export function usePublicContentFolders(limit = 20, offset = 0) {
  return useQuery({
    queryKey: queryKeys.contentFolders.public(limit, offset),
    queryFn: () => api.contentFolders.listPublic(limit, offset),
  });
}

/**
 * List featured content folders from the marketplace.
 */
export function useFeaturedContentFolders(limit = 10) {
  return useQuery({
    queryKey: queryKeys.contentFolders.featured(limit),
    queryFn: () => api.contentFolders.listFeatured(limit),
  });
}

/**
 * Search public content folders.
 */
export function useSearchContentFolders(query: string) {
  return useQuery({
    queryKey: ["content-folders", "search", query] as const,
    queryFn: () => api.contentFolders.search(query),
    enabled: Boolean(query && query.length >= 2),
  });
}

/**
 * Get a public content folder by ID.
 */
export function usePublicContentFolder(folderId: string) {
  return useQuery({
    queryKey: ["content-folders", "public", folderId] as const,
    queryFn: () => api.contentFolders.getPublic(folderId),
    enabled: Boolean(folderId),
  });
}

/**
 * Import a content folder to a server.
 */
export function useImportContentFolder() {
  return useMutation({
    mutationFn: ({ folderId, serverId }: { folderId: string; serverId: string }) =>
      api.contentFolders.import(folderId, serverId),
    onSuccess: () => {
      toast.success("Folder imported successfully");
    },
    onError: () => toast.error("Failed to import folder"),
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Ratings
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Get ratings for a content folder.
 */
export function useContentFolderRatings(folderId: string) {
  return useQuery({
    queryKey: queryKeys.contentFolders.ratings(folderId),
    queryFn: () => api.contentFolders.getRatings(folderId),
    enabled: Boolean(folderId),
  });
}

/**
 * Create a rating for a content folder.
 */
export function useCreateContentFolderRating(folderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContentFolderRatingRequest) =>
      api.contentFolders.createRating(folderId, data),
    onSuccess: () => {
      toast.success("Rating submitted");
      queryClient.invalidateQueries({
        queryKey: queryKeys.contentFolders.ratings(folderId),
      });
    },
    onError: () => toast.error("Failed to submit rating"),
  });
}

/**
 * Get stats for a content folder (average rating, count).
 */
export function useContentFolderStats(folderId: string) {
  return useQuery({
    queryKey: queryKeys.contentFolders.myRating(folderId),
    queryFn: () => api.contentFolders.getStats(folderId),
    enabled: Boolean(folderId),
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Legacy Aliases (for backward compatibility)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * @deprecated Use useAddContentFolderItem instead
 */
export const useAddItemToFolder = useAddContentFolderItem;

/**
 * @deprecated Use useRemoveContentFolderItem instead
 */
export const useRemoveItemFromFolder = useRemoveContentFolderItem;