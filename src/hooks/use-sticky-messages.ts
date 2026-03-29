"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
	StickyMessage,
	CreateStickyMessageRequest,
	UpdateStickyMessageRequest,
} from "@/types/sticky-message";
import type { ApiError } from "@/types/api";

// Query Keys
const qk = {
	list: (serverId: string) => ["stickyMessages", "list", serverId] as const,
	detail: (serverId: string, id: string) => ["stickyMessages", "detail", serverId, id] as const,
	byChannel: (serverId: string, channelId: string) =>
		["stickyMessages", "channel", serverId, channelId] as const,
};

// ── List all sticky messages for a server ──
export function useStickyMessages(serverId: string) {
	return useQuery({
		queryKey: qk.list(serverId),
		queryFn: () => api.stickyMessages.list(serverId),
		staleTime: 1000 * 60 * 2,
		enabled: Boolean(serverId),
	});
}

// ── Get a single sticky message ──
export function useStickyMessage(serverId: string, id: string) {
	return useQuery({
		queryKey: qk.detail(serverId, id),
		queryFn: () => api.stickyMessages.get(serverId, id),
		enabled: Boolean(serverId && id),
	});
}

// ── List sticky messages by channel ──
export function useStickyMessagesByChannel(
	serverId: string,
	channelId: string
) {
	return useQuery({
		queryKey: qk.byChannel(serverId, channelId),
		queryFn: () => api.stickyMessages.listByChannel(serverId, channelId),
		staleTime: 1000 * 60 * 2,
		enabled: Boolean(serverId && channelId),
	});
}

// ── Create a sticky message ──
export function useCreateStickyMessage(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateStickyMessageRequest) =>
			api.stickyMessages.create(serverId, data),
		onSuccess: (created) => {
			toast.success("Sticky message created");
			qc.invalidateQueries({ queryKey: qk.list(serverId) });
			qc.invalidateQueries({
				queryKey: qk.byChannel(serverId, created.channel_id),
			});
			qc.setQueryData(qk.detail(serverId, created.id), created);
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to create sticky message";
			toast.error(message);
		},
	});
}

// ── Update a sticky message ──
export function useUpdateStickyMessage(serverId: string, id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateStickyMessageRequest) =>
			api.stickyMessages.update(serverId, id, data),
		onSuccess: (updated) => {
			toast.success("Sticky message saved");
			qc.setQueryData(qk.detail(serverId, id), updated);
			qc.invalidateQueries({ queryKey: qk.list(serverId) });
			if (updated.channel_id) {
				qc.invalidateQueries({
					queryKey: qk.byChannel(serverId, updated.channel_id),
				});
			}
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to save sticky message";
			toast.error(message);
		},
	});
}

// ── Delete a sticky message ──
export function useDeleteStickyMessage(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => api.stickyMessages.delete(serverId, id),
		onSuccess: (_res, id) => {
			toast.success("Sticky message deleted");
			qc.invalidateQueries({ queryKey: qk.list(serverId) });
			qc.removeQueries({ queryKey: qk.detail(serverId, id) });
		},
		onError: () => toast.error("Failed to delete sticky message"),
	});
}

// ── Increment the message counter ──
export function useIncrementStickyCount(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => api.stickyMessages.incrementCount(serverId, id),
		onSuccess: (_res, id) => {
			qc.invalidateQueries({ queryKey: qk.detail(serverId, id) });
		},
	});
}

// ── Reset the message counter ──
export function useResetStickyCount(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => api.stickyMessages.resetCount(serverId, id),
		onSuccess: (_res, id) => {
			toast.success("Counter reset");
			qc.invalidateQueries({ queryKey: qk.detail(serverId, id) });
		},
	});
}