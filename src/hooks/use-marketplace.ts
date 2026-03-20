/**
 * TanStack Query hooks for Marketplace
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { api } from "@/lib/api-client";
import type {
  MarketplaceTemplate,
  MarketplaceRating,
  MarketplaceImport,
  TemplateStats,
  PublishTemplatePayload,
  UpdateMarketplaceTemplatePayload,
  RateTemplatePayload,
  ImportTemplatePayload,
} from "@/types/platform-extensions";

// ═════════════════════════════════════════════════════════════════════════════
// Queries
// ═════════════════════════════════════════════════════════════════════════════

export function useMarketplaceTemplates(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.marketplace.templates(filters),
    queryFn: () => api.marketplace.listTemplates(filters),
  });
}

export function useFeaturedTemplates(limit?: number) {
  return useQuery({
    queryKey: queryKeys.marketplace.featured(),
    queryFn: () => api.marketplace.getFeatured(limit),
  });
}

export function useMarketplaceTemplate(templateId: string) {
  return useQuery({
    queryKey: queryKeys.marketplace.detail(templateId),
    queryFn: () => api.marketplace.getTemplate(templateId),
    enabled: !!templateId,
  });
}

export function useTemplateStats(templateId: string) {
  return useQuery({
    queryKey: queryKeys.marketplace.stats(templateId),
    queryFn: () => api.marketplace.getTemplateStats(templateId),
    enabled: !!templateId,
  });
}

export function useTemplateRatings(templateId: string) {
  return useQuery({
    queryKey: queryKeys.marketplace.ratings(templateId),
    queryFn: () => api.marketplace.getRatings(templateId),
    enabled: !!templateId,
  });
}

export function useMyTemplateRating(templateId: string) {
  return useQuery({
    queryKey: queryKeys.marketplace.myRating(templateId),
    queryFn: () => api.marketplace.getMyRating(templateId),
    enabled: !!templateId,
  });
}

export function useImportHistory(serverId: string) {
  return useQuery({
    queryKey: queryKeys.marketplace.importHistory(serverId),
    queryFn: () => api.marketplace.getImportHistory(serverId),
    enabled: !!serverId,
  });
}

export function useMyTemplates() {
  return useQuery({
    queryKey: queryKeys.marketplace.myTemplates(),
    queryFn: () => api.marketplace.getMyTemplates(),
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Mutations
// ═════════════════════════════════════════════════════════════════════════════

export function usePublishTemplate(templateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PublishTemplatePayload) =>
      api.marketplace.publishTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.marketplace.myTemplates(),
      });
    },
  });
}

export function useUpdateMarketplaceTemplate(templateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMarketplaceTemplatePayload) =>
      api.marketplace.updateTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.marketplace.detail(templateId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.marketplace.myTemplates(),
      });
    },
  });
}

export function useUnpublishTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) =>
      api.marketplace.unpublishTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.marketplace.myTemplates(),
      });
    },
  });
}

export function useRateTemplate(templateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RateTemplatePayload) =>
      api.marketplace.rateTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.marketplace.ratings(templateId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.marketplace.myRating(templateId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.marketplace.detail(templateId),
      });
    },
  });
}

export function useImportTemplate(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: ImportTemplatePayload }) =>
      api.marketplace.importTemplate(serverId, templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.marketplace.importHistory(serverId),
      });
    },
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Search
// ═════════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";

export function useSearchTemplates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const { data: templates, isLoading } = useQuery({
    queryKey: ["marketplace", "search", searchQuery, filters],
    queryFn: () =>
      searchQuery
        ? api.marketplace.searchTemplates(searchQuery, filters)
        : api.marketplace.listTemplates(filters),
    enabled: true,
  });

  const search = useCallback((query: string, newFilters?: Record<string, unknown>) => {
    setSearchQuery(query);
    if (newFilters) setFilters(newFilters);
  }, []);

  return {
    templates,
    isLoading,
    searchQuery,
    filters,
    search,
    setFilters,
  };
}
