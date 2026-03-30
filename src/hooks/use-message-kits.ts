"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
	MessageKit,
	MessageKitContent,
	MessageKitImport,
	MessageKitRating,
	CreateMessageKitRequest,
	UpdateMessageKitRequest,
	AddContentRequest,
	ImportKitRequest,
	CreateRatingRequest,
	UpdateRatingRequest,
	KitStats,
} from "@/types/message-kit";
import type { ApiError } from "@/types/api";

// Query Keys
const qk = {
	list: (serverId: string, filters?: Record<string, unknown>) => ["messageKits", serverId, "list", filters] as const,
	featured: (serverId: string, limit?: number) => ["messageKits", serverId, "featured", limit] as const,
	detail: (serverId: string, id: string) => ["messageKits", serverId, "detail", id] as const,
	contents: (serverId: string, id: string) => ["messageKits", serverId, "contents", id] as const,
	ratings: (serverId: string, id: string) => ["messageKits", serverId, "ratings", id] as const,
	myRating: (serverId: string, id: string) => ["messageKits", serverId, "myRating", id] as const,
	myTemplates: (serverId: string) => ["messageKits", serverId, "myTemplates"] as const,
	importHistory: (serverId: string) => ["messageKits", "importHistory", serverId] as const,
};

// ── List public message kits ──
export function useMessageKits(serverId: string, limit = 20, offset = 0) {
	return useQuery({
		queryKey: qk.list(serverId, { limit, offset }),
		queryFn: () => api.messageKits.listPublic(serverId, limit, offset),
		staleTime: 1000 * 60 * 2,
		enabled: Boolean(serverId),
	});
}

// ── List featured message kits ──
export function useFeaturedKits(serverId: string, limit = 10) {
	return useQuery({
		queryKey: qk.featured(serverId, limit),
		queryFn: () => api.messageKits.listFeatured(serverId, limit),
		staleTime: 1000 * 60 * 5,
		enabled: Boolean(serverId),
	});
}

// ── Get a single message kit ──
export function useMessageKit(serverId: string, id: string) {
	return useQuery({
		queryKey: qk.detail(serverId, id),
		queryFn: () => api.messageKits.get(serverId, id),
		enabled: Boolean(serverId && id),
	});
}

// ── Search message kits ──
export function useSearchKits(serverId: string, query: string, tags?: string[]) {
	return useQuery({
		queryKey: qk.list(serverId, { query, tags }),
		queryFn: () => api.messageKits.search(serverId, query, tags),
		staleTime: 1000 * 60 * 2,
		enabled: Boolean(serverId && (query || (tags && tags.length > 0))),
	});
}

// ── Get kit contents ──
export function useKitContents(serverId: string, id: string) {
	return useQuery({
		queryKey: qk.contents(serverId, id),
		queryFn: () => api.messageKits.getContents(serverId, id),
		enabled: Boolean(serverId && id),
	});
}

// ── Get kit ratings ──
export function useKitRatings(serverId: string, id: string) {
	return useQuery({
		queryKey: qk.ratings(serverId, id),
		queryFn: () => api.messageKits.getRatings(serverId, id),
		enabled: Boolean(serverId && id),
	});
}

// ── Get user's rating for a kit ──
export function useMyRating(serverId: string, id: string) {
	return useQuery({
		queryKey: qk.myRating(serverId, id),
		queryFn: () => api.messageKits.getMyRating(serverId, id),
		enabled: Boolean(serverId && id),
	});
}

// ── Get user's own templates ──
export function useMyTemplates(serverId: string) {
	return useQuery({
		queryKey: qk.myTemplates(serverId),
		queryFn: () => api.messageKits.getMyTemplates(serverId),
		enabled: Boolean(serverId),
	});
}

// ── Get import history ──
export function useImportHistory(serverId: string) {
	return useQuery({
		queryKey: qk.importHistory(serverId),
		queryFn: () => api.messageKits.getImportHistory(serverId),
		enabled: Boolean(serverId),
	});
}

// ── Create a message kit ──
export function useCreateMessageKit(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateMessageKitRequest) => api.messageKits.create(serverId, data),
		onSuccess: (created) => {
			toast.success("Message kit created");
			qc.invalidateQueries({ queryKey: qk.myTemplates(serverId) });
			qc.setQueryData(qk.detail(serverId, created.id), created);
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to create message kit";
			toast.error(message);
		},
	});
}

// ── Update a message kit ──
export function useUpdateMessageKit(serverId: string, id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateMessageKitRequest) => api.messageKits.update(serverId, id, data),
		onSuccess: (updated) => {
			toast.success("Message kit saved");
			qc.setQueryData(qk.detail(serverId, id), updated);
			qc.invalidateQueries({ queryKey: qk.myTemplates(serverId) });
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to save message kit";
			toast.error(message);
		},
	});
}

// ── Delete a message kit ──
export function useDeleteMessageKit(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => api.messageKits.delete(serverId, id),
		onSuccess: (_res, id) => {
			toast.success("Message kit deleted");
			qc.invalidateQueries({ queryKey: qk.myTemplates(serverId) });
			qc.removeQueries({ queryKey: qk.detail(serverId, id) });
		},
		onError: () => toast.error("Failed to delete message kit"),
	});
}

// ── Add content to a kit ──
export function useAddContent(serverId: string, id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: AddContentRequest) => api.messageKits.addContent(serverId, id, data),
		onSuccess: () => {
			toast.success("Content added");
			qc.invalidateQueries({ queryKey: qk.contents(serverId, id) });
		},
		onError: () => toast.error("Failed to add content"),
	});
}

// ── Delete content from a kit ──
export function useDeleteContent(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (contentId: string) => api.messageKits.deleteContent(serverId, contentId),
		onSuccess: () => {
			toast.success("Content removed");
			qc.invalidateQueries({ queryKey: ["messageKits", serverId, "contents"] });
		},
		onError: () => toast.error("Failed to delete content"),
	});
}

// ── Import a kit to a server ──
export function useImportKit() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ kitId, serverId }: { kitId: string; serverId: string }) =>
			api.messageKits.import(kitId, serverId),
		onSuccess: (_res, { kitId, serverId }) => {
			toast.success("Kit imported successfully");
			qc.invalidateQueries({ queryKey: qk.importHistory(serverId) });
			qc.invalidateQueries({ queryKey: qk.detail(serverId, kitId) });
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to import kit";
			toast.error(message);
		},
	});
}

// ── Create a rating ──
export function useCreateRating(serverId: string, id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateRatingRequest) => api.messageKits.createRating(serverId, id, data),
		onSuccess: () => {
			toast.success("Rating submitted");
			qc.invalidateQueries({ queryKey: qk.ratings(serverId, id) });
			qc.invalidateQueries({ queryKey: qk.myRating(serverId, id) });
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to submit rating";
			toast.error(message);
		},
	});
}

// ── Update a rating ──
export function useUpdateRating(serverId: string, id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateRatingRequest) => api.messageKits.updateRating(serverId, id, data),
		onSuccess: () => {
			toast.success("Rating updated");
			qc.invalidateQueries({ queryKey: qk.ratings(serverId, id) });
			qc.invalidateQueries({ queryKey: qk.myRating(serverId, id) });
		},
		onError: () => toast.error("Failed to update rating"),
	});
}