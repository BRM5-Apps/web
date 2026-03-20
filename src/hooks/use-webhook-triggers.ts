/**
 * TanStack Query hooks for Webhook Triggers
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { api } from "@/lib/api-client";
import type {
  WebhookTrigger,
  WebhookTriggerExecution,
  CreateWebhookTriggerPayload,
  UpdateWebhookTriggerPayload,
} from "@/types/platform-extensions";

// ═════════════════════════════════════════════════════════════════════════════
// Queries
// ═════════════════════════════════════════════════════════════════════════════

export function useWebhookTriggers(serverId: string) {
  return useQuery({
    queryKey: queryKeys.webhookTriggers.all(serverId),
    queryFn: () => api.webhookTriggers.list(serverId),
    enabled: !!serverId,
  });
}

export function useWebhookTrigger(serverId: string, triggerId: string) {
  return useQuery({
    queryKey: queryKeys.webhookTriggers.detail(serverId, triggerId),
    queryFn: () => api.webhookTriggers.get(serverId, triggerId),
    enabled: !!serverId && !!triggerId,
  });
}

export function useWebhookTriggerHistory(serverId: string, triggerId: string) {
  return useQuery({
    queryKey: queryKeys.webhookTriggers.history(serverId, triggerId),
    queryFn: () => api.webhookTriggers.history(serverId, triggerId),
    enabled: !!serverId && !!triggerId,
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Mutations
// ═════════════════════════════════════════════════════════════════════════════

export function useCreateWebhookTrigger(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWebhookTriggerPayload) =>
      api.webhookTriggers.create(serverId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.webhookTriggers.all(serverId),
      });
    },
  });
}

export function useUpdateWebhookTrigger(serverId: string, triggerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWebhookTriggerPayload) =>
      api.webhookTriggers.update(serverId, triggerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.webhookTriggers.detail(serverId, triggerId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.webhookTriggers.all(serverId),
      });
    },
  });
}

export function useDeleteWebhookTrigger(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (triggerId: string) =>
      api.webhookTriggers.delete(serverId, triggerId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.webhookTriggers.all(serverId),
      });
    },
  });
}
