"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
	DefaultMessage,
	CreateDefaultMessageRequest,
	UpdateDefaultMessageRequest,
	MessageCategory,
} from "@/types/default-message";
import type { ApiError } from "@/types/api";

// Query Keys
const qk = {
	list: (serverId: string) => ["defaultMessages", "list", serverId] as const,
	detail: (serverId: string, id: string) => ["defaultMessages", "detail", serverId, id] as const,
	byKey: (serverId: string, key: string) => ["defaultMessages", "byKey", serverId, key] as const,
	byCategory: (serverId: string, category: MessageCategory) =>
		["defaultMessages", "category", serverId, category] as const,
};

// ── List all default messages for a server ──
export function useDefaultMessages(serverId: string) {
	return useQuery({
		queryKey: qk.list(serverId),
		queryFn: () => api.defaultMessages.list(serverId),
		staleTime: 1000 * 60 * 2,
		enabled: Boolean(serverId),
	});
}

// ── Get a single default message by ID ──
export function useDefaultMessage(serverId: string, id: string) {
	return useQuery({
		queryKey: qk.detail(serverId, id),
		queryFn: () => api.defaultMessages.get(serverId, id),
		enabled: Boolean(serverId && id),
	});
}

// ── Get a default message by key ──
export function useDefaultMessageByKey(serverId: string, key: string) {
	return useQuery({
		queryKey: qk.byKey(serverId, key),
		queryFn: () => api.defaultMessages.getByKey(serverId, key),
		enabled: Boolean(serverId && key),
	});
}

// ── List default messages by category ──
export function useDefaultMessagesByCategory(
	serverId: string,
	category: MessageCategory
) {
	return useQuery({
		queryKey: qk.byCategory(serverId, category),
		queryFn: () => api.defaultMessages.listByCategory(serverId, category),
		staleTime: 1000 * 60 * 2,
		enabled: Boolean(serverId && category),
	});
}

// ── Create a default message ──
export function useCreateDefaultMessage(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateDefaultMessageRequest) =>
			api.defaultMessages.create(serverId, data),
		onSuccess: (created) => {
			toast.success("Default message created");
			qc.invalidateQueries({ queryKey: qk.list(serverId) });
			qc.invalidateQueries({
				queryKey: qk.byCategory(serverId, created.category as MessageCategory),
			});
			qc.setQueryData(qk.detail(serverId, created.id), created);
			qc.setQueryData(qk.byKey(serverId, created.key), created);
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to create default message";
			toast.error(message);
		},
	});
}

// ── Update a default message ──
export function useUpdateDefaultMessage(serverId: string, id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateDefaultMessageRequest) =>
			api.defaultMessages.update(serverId, id, data),
		onSuccess: (updated) => {
			toast.success("Default message saved");
			qc.setQueryData(qk.detail(serverId, id), updated);
			qc.invalidateQueries({ queryKey: qk.list(serverId) });
			qc.invalidateQueries({ queryKey: qk.byKey(serverId, updated.key) });
			qc.invalidateQueries({
				queryKey: qk.byCategory(serverId, updated.category as MessageCategory),
			});
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to save default message";
			toast.error(message);
		},
	});
}

// ── Delete a default message ──
export function useDeleteDefaultMessage(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => api.defaultMessages.delete(serverId, id),
		onSuccess: (_res, id) => {
			toast.success("Default message deleted");
			qc.invalidateQueries({ queryKey: qk.list(serverId) });
			qc.removeQueries({ queryKey: qk.detail(serverId, id) });
		},
		onError: () => toast.error("Failed to delete default message"),
	});
}