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

export function useEmbedTemplates(serverId: string) {
  return useQuery({
    queryKey: qk.embeds(serverId),
    queryFn: () => api.templates.listEmbeds(serverId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(serverId),
  });
}

export function useEmbedTemplate(serverId: string, id: string) {
  return useQuery({
    queryKey: qk.embed(serverId, id),
    queryFn: () => api.templates.getEmbed(serverId, id),
    enabled: Boolean(serverId && id),
  });
}

export function useCreateEmbedTemplate(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EmbedTemplate>) => api.templates.createEmbed(serverId, data),
    onSuccess: (created) => {
      toast.success("Embed template created");
      qc.invalidateQueries({ queryKey: qk.embeds(serverId) });
      qc.setQueryData(qk.embed(serverId, created.id), created);
    },
    onError: (err: unknown) => {
      toast.error(typeof err === "object" && err && "message" in err ? (err as any).message : "Failed to create template");
    },
  });
}

export function useUpdateEmbedTemplate(serverId: string, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EmbedTemplate>) => api.templates.updateEmbed(serverId, id, data),
    onSuccess: (updated) => {
      toast.success("Embed template saved");
      qc.setQueryData(qk.embed(serverId, id), updated);
      qc.invalidateQueries({ queryKey: qk.embeds(serverId) });
    },
    onError: (err: unknown) => {
      toast.error(typeof err === "object" && err && "message" in err ? (err as any).message : "Failed to save template");
    },
  });
}

export function useDeleteEmbedTemplate(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.templates.deleteEmbed(serverId, id),
    onSuccess: (_res, id) => {
      toast.success("Embed template deleted");
      qc.invalidateQueries({ queryKey: qk.embeds(serverId) });
      qc.removeQueries({ queryKey: qk.embed(serverId, id) });
    },
    onError: () => toast.error("Failed to delete template"),
  });
}

// ── Container Templates ──

export function useContainerTemplates(serverId: string) {
  return useQuery({
    queryKey: qk.containers(serverId),
    queryFn: () => api.templates.listContainers(serverId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(serverId),
  });
}

export function useContainerTemplate(serverId: string, id: string) {
  return useQuery({
    queryKey: qk.container(serverId, id),
    queryFn: () => api.templates.getContainer(serverId, id),
    enabled: Boolean(serverId && id),
  });
}

export function useCreateContainerTemplate(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ContainerTemplate>) => api.templates.createContainer(serverId, data),
    onSuccess: (created) => {
      toast.success("Container template created");
      qc.invalidateQueries({ queryKey: qk.containers(serverId) });
      qc.setQueryData(qk.container(serverId, created.id), created);
    },
    onError: (err: ApiError) => toast.error(err?.message ?? "Failed to create container"),
  });
}

export function useUpdateContainerTemplate(serverId: string, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ContainerTemplate>) => api.templates.updateContainer(serverId, id, data),
    onSuccess: (updated) => {
      toast.success("Container template saved");
      qc.setQueryData(qk.container(serverId, id), updated);
      qc.invalidateQueries({ queryKey: qk.containers(serverId) });
    },
    onError: () => toast.error("Failed to save container"),
  });
}

export function useDeleteContainerTemplate(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.templates.deleteContainer(serverId, id),
    onSuccess: (_res, id) => {
      toast.success("Container template deleted");
      qc.invalidateQueries({ queryKey: qk.containers(serverId) });
      qc.removeQueries({ queryKey: qk.container(serverId, id) });
    },
    onError: () => toast.error("Failed to delete container"),
  });
}

// ── Text Templates ──

export function useTextTemplates(serverId: string) {
  return useQuery({
    queryKey: qk.texts(serverId),
    queryFn: () => api.templates.listTexts(serverId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(serverId),
  });
}

export function useTextTemplate(serverId: string, id: string) {
  return useQuery({
    queryKey: qk.text(serverId, id),
    queryFn: () => api.templates.getText(serverId, id),
    enabled: Boolean(serverId && id),
  });
}

export function useCreateTextTemplate(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TextTemplate>) => api.templates.createText(serverId, data),
    onSuccess: (created) => {
      toast.success("Text template created");
      qc.invalidateQueries({ queryKey: qk.texts(serverId) });
      qc.setQueryData(qk.text(serverId, created.id), created);
    },
    onError: () => toast.error("Failed to create text template"),
  });
}

export function useUpdateTextTemplate(serverId: string, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TextTemplate>) => api.templates.updateText(serverId, id, data),
    onSuccess: (updated) => {
      toast.success("Text template saved");
      qc.setQueryData(qk.text(serverId, id), updated);
      qc.invalidateQueries({ queryKey: qk.texts(serverId) });
    },
    onError: () => toast.error("Failed to save text template"),
  });
}

export function useDeleteTextTemplate(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.templates.deleteText(serverId, id),
    onSuccess: (_res, id) => {
      toast.success("Text template deleted");
      qc.invalidateQueries({ queryKey: qk.texts(serverId) });
      qc.removeQueries({ queryKey: qk.text(serverId, id) });
    },
    onError: () => toast.error("Failed to delete text template"),
  });
}

// ── Modal Templates ──

export function useModalTemplates(serverId: string) {
  return useQuery({
    queryKey: qk.modals(serverId),
    queryFn: () => api.templates.listModals(serverId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(serverId),
  });
}

export function useCreateModalTemplate(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ModalTemplate>) => api.templates.createModal(serverId, data),
    onSuccess: (created) => {
      toast.success("Modal template saved");
      qc.invalidateQueries({ queryKey: qk.modals(serverId) });
      qc.setQueryData(qk.modal(serverId, created.id), created);
    },
    onError: () => toast.error("Failed to save modal template"),
  });
}

export function useUpdateModalTemplate(serverId: string, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ModalTemplate>) => api.templates.updateModal(serverId, id, data),
    onSuccess: (updated) => {
      toast.success("Modal template saved");
      qc.setQueryData(qk.modal(serverId, id), updated);
      qc.invalidateQueries({ queryKey: qk.modals(serverId) });
    },
    onError: () => toast.error("Failed to save modal template"),
  });
}

export function useDeleteModalTemplate(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.templates.deleteModal(serverId, id),
    onSuccess: (_res, id) => {
      toast.success("Modal template deleted");
      qc.invalidateQueries({ queryKey: qk.modals(serverId) });
      qc.removeQueries({ queryKey: qk.modal(serverId, id) });
    },
    onError: () => toast.error("Failed to delete modal template"),
  });
}

// ── All templates for a server (for Send Output picker) ──

export function useAllTemplates(serverId: string) {
  const embeds = useQuery({
    queryKey: qk.embeds(serverId),
    queryFn: () => api.templates.listEmbeds(serverId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(serverId),
  });
  const containers = useQuery({
    queryKey: qk.containers(serverId),
    queryFn: () => api.templates.listContainers(serverId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(serverId),
  });
  const texts = useQuery({
    queryKey: qk.texts(serverId),
    queryFn: () => api.templates.listTexts(serverId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(serverId),
  });
  const modals = useQuery({
    queryKey: qk.modals(serverId),
    queryFn: () => api.templates.listModals(serverId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(serverId),
  });

  return {
    embeds: embeds.data ?? [],
    containers: containers.data ?? [],
    texts: texts.data ?? [],
    modals: modals.data ?? [],
    isLoading: embeds.isLoading || containers.isLoading || texts.isLoading || modals.isLoading,
  };
}
