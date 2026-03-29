"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { ModalElementRegistration } from "@/types/template";

const qk = {
  list: (serverId: string) => ["modal-elements", serverId] as const,
  byModal: (serverId: string, modalTemplateId: string) =>
    ["modal-elements", serverId, "modal", modalTemplateId] as const,
};

/**
 * Hook to fetch all modal element registrations for a server
 */
export function useModalElements(serverId: string) {
  return useQuery({
    queryKey: qk.list(serverId),
    queryFn: () => api.modalElements.list(serverId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(serverId),
    retry: false,
  });
}

/**
 * Hook to fetch modal element registrations for a specific modal template
 */
export function useModalElementsByModal(serverId: string, modalTemplateId: string) {
  return useQuery({
    queryKey: qk.byModal(serverId, modalTemplateId),
    queryFn: () => api.modalElements.listByModal(serverId, modalTemplateId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(serverId) && Boolean(modalTemplateId),
    retry: false,
  });
}

/**
 * Hook to sync modal element registrations when saving a modal
 * This should be called when a modal template is saved to update
 * the element registrations for all input fields in the modal.
 */
export function useSyncModalElements(serverId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      modal_template_id: string;
      modal_name: string;
      fields: Array<{
        field_id: string;
        field_type: string;
        field_label: string;
        is_required: boolean;
      }>;
    }) => api.modalElements.sync(serverId, data),
    onSuccess: (_, variables) => {
      // Invalidate both the server-wide list and the specific modal list
      qc.invalidateQueries({ queryKey: qk.list(serverId) });
      qc.invalidateQueries({
        queryKey: qk.byModal(serverId, variables.modal_template_id),
      });
      // Also invalidate elements since modal elements affect the element catalog
      qc.invalidateQueries({ queryKey: ["elements", serverId] });
    },
    onError: () => toast.error("Failed to sync modal elements"),
  });
}

/**
 * Hook to delete modal element registrations when deleting a modal template
 */
export function useDeleteModalElements(serverId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (modalTemplateId: string) =>
      api.modalElements.deleteByModal(serverId, modalTemplateId),
    onSuccess: (_, modalTemplateId) => {
      qc.invalidateQueries({ queryKey: qk.list(serverId) });
      qc.invalidateQueries({
        queryKey: qk.byModal(serverId, modalTemplateId),
      });
      // Also invalidate elements since modal elements affect the element catalog
      qc.invalidateQueries({ queryKey: ["elements", serverId] });
      toast.success("Modal elements deleted");
    },
    onError: () => toast.error("Failed to delete modal elements"),
  });
}

/**
 * Helper to convert modal field data to sync request format
 */
export function buildSyncRequest(
  modalTemplateId: string,
  modalName: string,
  fields: Array<{
    id: string;
    type: string;
    label?: string;
    required?: boolean;
  }>
): {
  modal_template_id: string;
  modal_name: string;
  fields: Array<{
    field_id: string;
    field_type: string;
    field_label: string;
    is_required: boolean;
  }>;
} {
  return {
    modal_template_id: modalTemplateId,
    modal_name: modalName,
    fields: fields.map((field) => ({
      field_id: field.id,
      field_type: field.type,
      field_label: field.label || field.id,
      is_required: field.required ?? false,
    })),
  };
}

/**
 * Helper to generate element key preview (matches backend logic)
 */
export function generateElementKey(modalName: string, fieldLabel: string): string {
  const key = `${modalName}_${fieldLabel}`.toLowerCase();
  // Replace non-alphanumeric characters with underscores
  const normalized = key.replace(/[^a-z0-9_]+/g, "_");
  // Replace multiple underscores with single underscore
  const singleUnderscore = normalized.replace(/_+/g, "_");
  // Trim leading/trailing underscores
  return singleUnderscore.replace(/^_+|_+$/g, "");
}