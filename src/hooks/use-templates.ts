"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { EmbedTemplate, ContainerTemplate, TextTemplate, ModalTemplate } from "@/types/template";
import type { ApiError } from "@/types/api";

// Query Keys
const qk = {
  embeds: (f: string) => ["templates", "embeds", f] as const,
  embed: (f: string, id: string) => ["templates", "embed", f, id] as const,
  containers: (f: string) => ["templates", "containers", f] as const,
  container: (f: string, id: string) => ["templates", "container", f, id] as const,
  texts: (f: string) => ["templates", "texts", f] as const,
  text: (f: string, id: string) => ["templates", "text", f, id] as const,
  modals: (f: string) => ["templates", "modals", f] as const,
  modal: (f: string, id: string) => ["templates", "modal", f, id] as const,
};

// ── Embed Templates ──

export function useEmbedTemplates(factionId: string) {
  return useQuery({
    queryKey: qk.embeds(factionId),
    queryFn: () => api.templates.listEmbeds(factionId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(factionId),
  });
}

export function useEmbedTemplate(factionId: string, id: string) {
  return useQuery({
    queryKey: qk.embed(factionId, id),
    queryFn: () => api.templates.getEmbed(factionId, id),
    enabled: Boolean(factionId && id),
  });
}

export function useCreateEmbedTemplate(factionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EmbedTemplate>) => api.templates.createEmbed(factionId, data),
    onSuccess: (created) => {
      toast.success("Embed template created");
      qc.invalidateQueries({ queryKey: qk.embeds(factionId) });
      qc.setQueryData(qk.embed(factionId, created.id), created);
    },
    onError: (err: unknown) => {
      toast.error(typeof err === "object" && err && "message" in err ? (err as any).message : "Failed to create template");
    },
  });
}

export function useUpdateEmbedTemplate(factionId: string, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EmbedTemplate>) => api.templates.updateEmbed(factionId, id, data),
    onSuccess: (updated) => {
      toast.success("Embed template saved");
      qc.setQueryData(qk.embed(factionId, id), updated);
      qc.invalidateQueries({ queryKey: qk.embeds(factionId) });
    },
    onError: (err: unknown) => {
      toast.error(typeof err === "object" && err && "message" in err ? (err as any).message : "Failed to save template");
    },
  });
}

export function useDeleteEmbedTemplate(factionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.templates.deleteEmbed(factionId, id),
    onSuccess: (_res, id) => {
      toast.success("Embed template deleted");
      qc.invalidateQueries({ queryKey: qk.embeds(factionId) });
      qc.removeQueries({ queryKey: qk.embed(factionId, id) });
    },
    onError: () => toast.error("Failed to delete template"),
  });
}

// ── Container Templates ──

export function useContainerTemplates(factionId: string) {
  return useQuery({
    queryKey: qk.containers(factionId),
    queryFn: () => api.templates.listContainers(factionId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(factionId),
  });
}

export function useContainerTemplate(factionId: string, id: string) {
  return useQuery({
    queryKey: qk.container(factionId, id),
    queryFn: () => api.templates.getContainer(factionId, id),
    enabled: Boolean(factionId && id),
  });
}

export function useCreateContainerTemplate(factionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ContainerTemplate>) => api.templates.createContainer(factionId, data),
    onSuccess: (created) => {
      toast.success("Container template created");
      qc.invalidateQueries({ queryKey: qk.containers(factionId) });
      qc.setQueryData(qk.container(factionId, created.id), created);
    },
    onError: (err: ApiError) => toast.error(err?.message ?? "Failed to create container"),
  });
}

export function useUpdateContainerTemplate(factionId: string, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ContainerTemplate>) => api.templates.updateContainer(factionId, id, data),
    onSuccess: (updated) => {
      toast.success("Container template saved");
      qc.setQueryData(qk.container(factionId, id), updated);
      qc.invalidateQueries({ queryKey: qk.containers(factionId) });
    },
    onError: () => toast.error("Failed to save container"),
  });
}

export function useDeleteContainerTemplate(factionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.templates.deleteContainer(factionId, id),
    onSuccess: (_res, id) => {
      toast.success("Container template deleted");
      qc.invalidateQueries({ queryKey: qk.containers(factionId) });
      qc.removeQueries({ queryKey: qk.container(factionId, id) });
    },
    onError: () => toast.error("Failed to delete container"),
  });
}

// ── Text Templates ──

export function useTextTemplates(factionId: string) {
  return useQuery({
    queryKey: qk.texts(factionId),
    queryFn: () => api.templates.listTexts(factionId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(factionId),
  });
}

export function useTextTemplate(factionId: string, id: string) {
  return useQuery({
    queryKey: qk.text(factionId, id),
    queryFn: () => api.templates.getText(factionId, id),
    enabled: Boolean(factionId && id),
  });
}

export function useCreateTextTemplate(factionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TextTemplate>) => api.templates.createText(factionId, data),
    onSuccess: (created) => {
      toast.success("Text template created");
      qc.invalidateQueries({ queryKey: qk.texts(factionId) });
      qc.setQueryData(qk.text(factionId, created.id), created);
    },
    onError: () => toast.error("Failed to create text template"),
  });
}

export function useUpdateTextTemplate(factionId: string, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TextTemplate>) => api.templates.updateText(factionId, id, data),
    onSuccess: (updated) => {
      toast.success("Text template saved");
      qc.setQueryData(qk.text(factionId, id), updated);
      qc.invalidateQueries({ queryKey: qk.texts(factionId) });
    },
    onError: () => toast.error("Failed to save text template"),
  });
}

export function useDeleteTextTemplate(factionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.templates.deleteText(factionId, id),
    onSuccess: (_res, id) => {
      toast.success("Text template deleted");
      qc.invalidateQueries({ queryKey: qk.texts(factionId) });
      qc.removeQueries({ queryKey: qk.text(factionId, id) });
    },
    onError: () => toast.error("Failed to delete text template"),
  });
}

// ── Modal Templates ──

export function useModalTemplates(factionId: string) {
  return useQuery({
    queryKey: qk.modals(factionId),
    queryFn: () => api.templates.listModals(factionId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(factionId),
  });
}

export function useCreateModalTemplate(factionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ModalTemplate>) => api.templates.createModal(factionId, data),
    onSuccess: (created) => {
      toast.success("Modal template saved");
      qc.invalidateQueries({ queryKey: qk.modals(factionId) });
      qc.setQueryData(qk.modal(factionId, created.id), created);
    },
    onError: () => toast.error("Failed to save modal template"),
  });
}

export function useUpdateModalTemplate(factionId: string, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ModalTemplate>) => api.templates.updateModal(factionId, id, data),
    onSuccess: (updated) => {
      toast.success("Modal template saved");
      qc.setQueryData(qk.modal(factionId, id), updated);
      qc.invalidateQueries({ queryKey: qk.modals(factionId) });
    },
    onError: () => toast.error("Failed to save modal template"),
  });
}

export function useDeleteModalTemplate(factionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.templates.deleteModal(factionId, id),
    onSuccess: (_res, id) => {
      toast.success("Modal template deleted");
      qc.invalidateQueries({ queryKey: qk.modals(factionId) });
      qc.removeQueries({ queryKey: qk.modal(factionId, id) });
    },
    onError: () => toast.error("Failed to delete modal template"),
  });
}

// ── All templates for a faction (for Send Output picker) ──

export function useAllTemplates(factionId: string) {
  const embeds = useQuery({
    queryKey: qk.embeds(factionId),
    queryFn: () => api.templates.listEmbeds(factionId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(factionId),
  });
  const containers = useQuery({
    queryKey: qk.containers(factionId),
    queryFn: () => api.templates.listContainers(factionId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(factionId),
  });
  const texts = useQuery({
    queryKey: qk.texts(factionId),
    queryFn: () => api.templates.listTexts(factionId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(factionId),
  });
  const modals = useQuery({
    queryKey: qk.modals(factionId),
    queryFn: () => api.templates.listModals(factionId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(factionId),
  });

  return {
    embeds: embeds.data ?? [],
    containers: containers.data ?? [],
    texts: texts.data ?? [],
    modals: modals.data ?? [],
    isLoading: embeds.isLoading || containers.isLoading || texts.isLoading || modals.isLoading,
  };
}
