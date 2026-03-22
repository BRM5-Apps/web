/**
 * TanStack Query hooks for Analytics
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { api } from "@/lib/api-client";
import type {
  AnalyticsEvent,
  DashboardStats,
  EventSummary,
  UserActivity,
  TrackEventPayload,
} from "@/types/platform-extensions";

// ═════════════════════════════════════════════════════════════════════════════
// Queries
// ═════════════════════════════════════════════════════════════════════════════

export function useAnalyticsEvents(
  serverId: string,
  filters?: Record<string, unknown>
) {
  return useQuery({
    queryKey: queryKeys.analytics.events(serverId, filters),
    queryFn: () => api.analytics.getEvents(serverId, filters),
    enabled: !!serverId,
  });
}

export function useAnalyticsDashboard(serverId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard(serverId),
    queryFn: () => api.analytics.getDashboard(serverId),
    enabled: !!serverId,
    // Dashboard data changes frequently
    refetchInterval: 30000, // 30 seconds
  });
}

export function useAnalyticsSummary(
  serverId: string,
  dateRange?: Record<string, unknown>
) {
  return useQuery({
    queryKey: queryKeys.analytics.summary(serverId, dateRange),
    queryFn: () => api.analytics.getSummary(serverId, dateRange),
    enabled: !!serverId,
  });
}

export function useUserActivity(serverId: string, userId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.userActivity(serverId, userId),
    queryFn: () => api.analytics.getUserActivity(serverId, userId),
    enabled: !!serverId && !!userId,
  });
}

export function useTopEvents(serverId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.topEvents(serverId),
    queryFn: () => api.analytics.getTopEvents(serverId),
    enabled: !!serverId,
  });
}

export function useAnalyticsMetrics(
  serverId: string,
  metricType: string,
  dateRange?: Record<string, unknown>
) {
  return useQuery({
    queryKey: queryKeys.analytics.metrics(serverId, metricType),
    queryFn: () => api.analytics.getMetrics(serverId, metricType, dateRange),
    enabled: !!serverId && !!metricType,
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Mutations
// ═════════════════════════════════════════════════════════════════════════════

export function useTrackEvent(serverId: string) {
  return useMutation({
    mutationFn: (data: TrackEventPayload) =>
      api.analytics.trackEvent(serverId, data),
  });
}
