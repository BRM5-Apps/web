/**
 * TanStack Query hooks for Multi-Step Modules
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { api } from "@/lib/api-client";
import type {
  MultiStepModule,
  ModuleStep,
  CreateMultiStepModulePayload,
  UpdateMultiStepModulePayload,
  AddModuleStepPayload,
} from "@/types/platform-extensions";

// ═════════════════════════════════════════════════════════════════════════════
// Queries
// ═════════════════════════════════════════════════════════════════════════════

export function useMultiStepModules(serverId: string) {
  return useQuery({
    queryKey: queryKeys.multiStepModules.all(serverId),
    queryFn: () => api.multiStepModules.list(serverId),
    enabled: !!serverId,
  });
}

export function useMultiStepModule(serverId: string, moduleId: string) {
  return useQuery({
    queryKey: queryKeys.multiStepModules.detail(serverId, moduleId),
    queryFn: () => api.multiStepModules.get(serverId, moduleId),
    enabled: !!serverId && !!moduleId,
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Module Mutations
// ═════════════════════════════════════════════════════════════════════════════

export function useCreateMultiStepModule(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMultiStepModulePayload) =>
      api.multiStepModules.create(serverId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.multiStepModules.all(serverId),
      });
    },
  });
}

export function useUpdateMultiStepModule(serverId: string, moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMultiStepModulePayload) =>
      api.multiStepModules.update(serverId, moduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.multiStepModules.detail(serverId, moduleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.multiStepModules.all(serverId),
      });
    },
  });
}

export function useDeleteMultiStepModule(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) =>
      api.multiStepModules.delete(serverId, moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.multiStepModules.all(serverId),
      });
    },
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Step Mutations
// ═════════════════════════════════════════════════════════════════════════════

export function useAddModuleStep(serverId: string, moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddModuleStepPayload) =>
      api.multiStepModules.addStep(serverId, moduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.multiStepModules.detail(serverId, moduleId),
      });
    },
  });
}

export function useUpdateModuleStep(serverId: string, moduleId: string, stepId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddModuleStepPayload) =>
      api.multiStepModules.updateStep(serverId, moduleId, stepId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.multiStepModules.detail(serverId, moduleId),
      });
    },
  });
}

export function useDeleteModuleStep(serverId: string, moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stepId: string) =>
      api.multiStepModules.deleteStep(serverId, moduleId, stepId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.multiStepModules.detail(serverId, moduleId),
      });
    },
  });
}
