/**
 * TanStack Query hooks for Scheduled Sequences
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { api } from "@/lib/api-client";
import type {
  ScheduledSequence,
  ScheduledSequenceExecution,
  CreateScheduledSequencePayload,
  UpdateScheduledSequencePayload,
} from "@/types/platform-extensions";

// ═════════════════════════════════════════════════════════════════════════════
// Queries
// ═════════════════════════════════════════════════════════════════════════════

export function useScheduledSequences(serverId: string) {
  return useQuery({
    queryKey: queryKeys.scheduledSequences.all(serverId),
    queryFn: () => api.scheduledSequences.list(serverId),
    enabled: !!serverId,
  });
}

export function useScheduledSequence(serverId: string, sequenceId: string) {
  return useQuery({
    queryKey: queryKeys.scheduledSequences.detail(serverId, sequenceId),
    queryFn: () => api.scheduledSequences.get(serverId, sequenceId),
    enabled: !!serverId && !!sequenceId,
  });
}

export function useScheduledSequenceHistory(serverId: string, sequenceId: string) {
  return useQuery({
    queryKey: queryKeys.scheduledSequences.history(serverId, sequenceId),
    queryFn: () => api.scheduledSequences.history(serverId, sequenceId),
    enabled: !!serverId && !!sequenceId,
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Mutations
// ═════════════════════════════════════════════════════════════════════════════

export function useCreateScheduledSequence(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduledSequencePayload) =>
      api.scheduledSequences.create(serverId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.scheduledSequences.all(serverId),
      });
    },
  });
}

export function useUpdateScheduledSequence(serverId: string, sequenceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateScheduledSequencePayload) =>
      api.scheduledSequences.update(serverId, sequenceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.scheduledSequences.detail(serverId, sequenceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.scheduledSequences.all(serverId),
      });
    },
  });
}

export function useDeleteScheduledSequence(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sequenceId: string) =>
      api.scheduledSequences.delete(serverId, sequenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.scheduledSequences.all(serverId),
      });
    },
  });
}

export function useDuplicateScheduledSequence(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sequenceId: string) =>
      api.scheduledSequences.duplicate(serverId, sequenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.scheduledSequences.all(serverId),
      });
    },
  });
}

export function useExecuteScheduledSequence(serverId: string, sequenceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.scheduledSequences.execute(serverId, sequenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.scheduledSequences.history(serverId, sequenceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.scheduledSequences.detail(serverId, sequenceId),
      });
    },
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Cron Validation
// ═════════════════════════════════════════════════════════════════════════════

export function useValidateCron() {
  return useMutation({
    mutationFn: ({ cronExpression, timezone }: { cronExpression: string; timezone?: string }) =>
      api.scheduledSequences.validateCron({ cron_expression: cronExpression, timezone }),
  });
}
