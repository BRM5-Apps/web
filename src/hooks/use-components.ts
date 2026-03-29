"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
	ButtonTemplate,
	SelectMenuTemplate,
	ComponentAttachment,
	CreateButtonTemplateRequest,
	UpdateButtonTemplateRequest,
	CreateSelectMenuTemplateRequest,
	UpdateSelectMenuTemplateRequest,
	CreateComponentAttachmentRequest,
	ReorderComponentsRequest,
} from "@/types/component";
import type { ApiError } from "@/types/api";

// Query Keys
const qk = {
	buttons: (serverId: string) => ["components", "buttons", serverId] as const,
	button: (serverId: string, id: string) => ["components", "button", serverId, id] as const,
	selectMenus: (serverId: string) => ["components", "selectMenus", serverId] as const,
	selectMenu: (serverId: string, id: string) => ["components", "selectMenu", serverId, id] as const,
	attachments: (serverId: string, containerId: string) => ["components", "attachments", serverId, containerId] as const,
};

// ── Button Templates ──

export function useButtonTemplates(serverId: string) {
	return useQuery({
		queryKey: qk.buttons(serverId),
		queryFn: () => api.components.listButtons(serverId),
		staleTime: 1000 * 60 * 2,
		enabled: Boolean(serverId),
	});
}

export function useButtonTemplate(serverId: string, id: string) {
	return useQuery({
		queryKey: qk.button(serverId, id),
		queryFn: () => api.components.getButton(serverId, id),
		enabled: Boolean(serverId && id),
	});
}

export function useCreateButtonTemplate(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateButtonTemplateRequest) =>
			api.components.createButton(serverId, data),
		onSuccess: (created) => {
			toast.success("Button template created");
			qc.invalidateQueries({ queryKey: qk.buttons(serverId) });
			qc.setQueryData(qk.button(serverId, created.id), created);
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to create button template";
			toast.error(message);
		},
	});
}

export function useUpdateButtonTemplate(serverId: string, id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateButtonTemplateRequest) =>
			api.components.updateButton(serverId, id, data),
		onSuccess: (updated) => {
			toast.success("Button template saved");
			qc.setQueryData(qk.button(serverId, id), updated);
			qc.invalidateQueries({ queryKey: qk.buttons(serverId) });
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to save button template";
			toast.error(message);
		},
	});
}

export function useDeleteButtonTemplate(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => api.components.deleteButton(serverId, id),
		onSuccess: (_res, id) => {
			toast.success("Button template deleted");
			qc.invalidateQueries({ queryKey: qk.buttons(serverId) });
			qc.removeQueries({ queryKey: qk.button(serverId, id) });
		},
		onError: () => toast.error("Failed to delete button template"),
	});
}

// ── Select Menu Templates ──

export function useSelectMenuTemplates(serverId: string) {
	return useQuery({
		queryKey: qk.selectMenus(serverId),
		queryFn: () => api.components.listSelectMenus(serverId),
		staleTime: 1000 * 60 * 2,
		enabled: Boolean(serverId),
	});
}

export function useSelectMenuTemplate(serverId: string, id: string) {
	return useQuery({
		queryKey: qk.selectMenu(serverId, id),
		queryFn: () => api.components.getSelectMenu(serverId, id),
		enabled: Boolean(serverId && id),
	});
}

export function useCreateSelectMenuTemplate(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateSelectMenuTemplateRequest) =>
			api.components.createSelectMenu(serverId, data),
		onSuccess: (created) => {
			toast.success("Select menu template created");
			qc.invalidateQueries({ queryKey: qk.selectMenus(serverId) });
			qc.setQueryData(qk.selectMenu(serverId, created.id), created);
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to create select menu template";
			toast.error(message);
		},
	});
}

export function useUpdateSelectMenuTemplate(serverId: string, id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateSelectMenuTemplateRequest) =>
			api.components.updateSelectMenu(serverId, id, data),
		onSuccess: (updated) => {
			toast.success("Select menu template saved");
			qc.setQueryData(qk.selectMenu(serverId, id), updated);
			qc.invalidateQueries({ queryKey: qk.selectMenus(serverId) });
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to save select menu template";
			toast.error(message);
		},
	});
}

export function useDeleteSelectMenuTemplate(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => api.components.deleteSelectMenu(serverId, id),
		onSuccess: (_res, id) => {
			toast.success("Select menu template deleted");
			qc.invalidateQueries({ queryKey: qk.selectMenus(serverId) });
			qc.removeQueries({ queryKey: qk.selectMenu(serverId, id) });
		},
		onError: () => toast.error("Failed to delete select menu template"),
	});
}

// ── Component Attachments ──

export function useComponentAttachments(serverId: string, containerId: string) {
	return useQuery({
		queryKey: qk.attachments(serverId, containerId),
		queryFn: () => api.components.getAttachments(serverId, containerId),
		staleTime: 1000 * 60 * 2,
		enabled: Boolean(serverId && containerId),
	});
}

export function useAttachComponent(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateComponentAttachmentRequest) =>
			api.components.attachComponent(serverId, data),
		onSuccess: (_res, variables) => {
			toast.success("Component attached");
			qc.invalidateQueries({
				queryKey: qk.attachments(serverId, variables.container_template_id),
			});
		},
		onError: () => toast.error("Failed to attach component"),
	});
}

export function useDetachComponent(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (attachmentId: string) =>
			api.components.detachComponent(serverId, attachmentId),
		onSuccess: () => {
			toast.success("Component detached");
			// Invalidate all attachment queries for this server
			qc.invalidateQueries({ queryKey: ["components", "attachments", serverId] });
		},
		onError: () => toast.error("Failed to detach component"),
	});
}

export function useDetachAllComponents(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (containerId: string) =>
			api.components.detachAllComponents(serverId, containerId),
		onSuccess: (_res, containerId) => {
			toast.success("All components detached");
			qc.invalidateQueries({ queryKey: qk.attachments(serverId, containerId) });
		},
		onError: () => toast.error("Failed to detach components"),
	});
}

export function useReorderComponents(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: ReorderComponentsRequest) =>
			api.components.reorderComponents(serverId, data),
		onSuccess: (_res, variables) => {
			toast.success("Components reordered");
			qc.invalidateQueries({
				queryKey: qk.attachments(serverId, variables.container_template_id),
			});
		},
		onError: () => toast.error("Failed to reorder components"),
	});
}