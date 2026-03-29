"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
	SendCommandConfig,
	SendCommandPermission,
	PendingSendRequest,
	CreateSendCommandConfigRequest,
	UpdateSendCommandConfigRequest,
	CreateSendCommandPermissionRequest,
	UpdateSendCommandPermissionRequest,
	CreatePendingSendRequestRequest,
	DenySendRequestRequest,
	MarkAsSentRequest,
	SendCommandStatus,
} from "@/types/send-command";
import type { ApiError } from "@/types/api";

// Query Keys
const qk = {
	config: (serverId: string) => ["sendCommand", "config", serverId] as const,
	permissions: (serverId: string) => ["sendCommand", "permissions", serverId] as const,
	pending: (serverId: string, status?: SendCommandStatus) =>
		["sendCommand", "pending", serverId, status] as const,
	pendingDetail: (id: string) => ["sendCommand", "pendingDetail", id] as const,
};

// ── Config ──

export function useSendCommandConfig(serverId: string) {
	return useQuery({
		queryKey: qk.config(serverId),
		queryFn: () => api.sendCommand.getConfig(serverId),
		enabled: Boolean(serverId),
	});
}

export function useCreateSendCommandConfig(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateSendCommandConfigRequest) =>
			api.sendCommand.createConfig(serverId, data),
		onSuccess: (created) => {
			toast.success("Send command config created");
			qc.setQueryData(qk.config(serverId), created);
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to create send command config";
			toast.error(message);
		},
	});
}

export function useUpdateSendCommandConfig(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateSendCommandConfigRequest) =>
			api.sendCommand.updateConfig(serverId, data),
		onSuccess: (updated) => {
			toast.success("Send command config updated");
			qc.setQueryData(qk.config(serverId), updated);
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to update send command config";
			toast.error(message);
		},
	});
}

export function useDeleteSendCommandConfig(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => api.sendCommand.deleteConfig(serverId),
		onSuccess: () => {
			toast.success("Send command config deleted");
			qc.removeQueries({ queryKey: qk.config(serverId) });
		},
		onError: () => toast.error("Failed to delete send command config"),
	});
}

// ── Permissions ──

export function useSendCommandPermissions(serverId: string) {
	return useQuery({
		queryKey: qk.permissions(serverId),
		queryFn: () => api.sendCommand.getPermissions(serverId),
		enabled: Boolean(serverId),
	});
}

export function useCreateSendCommandPermission(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateSendCommandPermissionRequest) =>
			api.sendCommand.createPermission(serverId, data),
		onSuccess: () => {
			toast.success("Permission created");
			qc.invalidateQueries({ queryKey: qk.permissions(serverId) });
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to create permission";
			toast.error(message);
		},
	});
}

export function useUpdateSendCommandPermission(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			permissionId,
			data,
		}: {
			permissionId: string;
			data: UpdateSendCommandPermissionRequest;
		}) => api.sendCommand.updatePermission(permissionId, data),
		onSuccess: () => {
			toast.success("Permission updated");
			qc.invalidateQueries({ queryKey: qk.permissions(serverId) });
		},
		onError: () => toast.error("Failed to update permission"),
	});
}

export function useDeleteSendCommandPermission(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (permissionId: string) =>
			api.sendCommand.deletePermission(permissionId),
		onSuccess: () => {
			toast.success("Permission deleted");
			qc.invalidateQueries({ queryKey: qk.permissions(serverId) });
		},
		onError: () => toast.error("Failed to delete permission"),
	});
}

export function useBatchUpdatePermissions(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (permissions: CreateSendCommandPermissionRequest[]) =>
			api.sendCommand.batchUpdatePermissions(serverId, permissions),
		onSuccess: () => {
			toast.success("Permissions updated");
			qc.invalidateQueries({ queryKey: qk.permissions(serverId) });
		},
		onError: () => toast.error("Failed to update permissions"),
	});
}

// ── Pending Requests ──

export function usePendingSendRequests(
	serverId: string,
	status?: SendCommandStatus,
	limit = 50,
	offset = 0
) {
	return useQuery({
		queryKey: qk.pending(serverId, status),
		queryFn: () => api.sendCommand.listPendingRequests(serverId, status, limit, offset),
		enabled: Boolean(serverId),
	});
}

export function usePendingSendRequest(id: string) {
	return useQuery({
		queryKey: qk.pendingDetail(id),
		queryFn: () => api.sendCommand.getPendingRequest(id),
		enabled: Boolean(id),
	});
}

export function useCreatePendingSendRequest(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreatePendingSendRequestRequest) =>
			api.sendCommand.createPendingRequest(serverId, data),
		onSuccess: (created) => {
			toast.success("Send request created");
			qc.invalidateQueries({ queryKey: qk.pending(serverId) });
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to create send request";
			toast.error(message);
		},
	});
}

export function useApproveSendRequest(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (requestId: string) =>
			api.sendCommand.approveRequest(requestId),
		onSuccess: () => {
			toast.success("Request approved");
			qc.invalidateQueries({ queryKey: qk.pending(serverId) });
		},
		onError: (err: unknown) => {
			const message =
				typeof err === "object" && err && "message" in err
					? (err as ApiError).message
					: "Failed to approve request";
			toast.error(message);
		},
	});
}

export function useDenySendRequest(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			requestId,
			data,
		}: {
			requestId: string;
			data?: DenySendRequestRequest;
		}) => api.sendCommand.denyRequest(requestId, data),
		onSuccess: () => {
			toast.success("Request denied");
			qc.invalidateQueries({ queryKey: qk.pending(serverId) });
		},
		onError: () => toast.error("Failed to deny request"),
	});
}

export function useMarkAsSent(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			requestId,
			data,
		}: {
			requestId: string;
			data: MarkAsSentRequest;
		}) => api.sendCommand.markAsSent(requestId, data),
		onSuccess: () => {
			toast.success("Request marked as sent");
			qc.invalidateQueries({ queryKey: qk.pending(serverId) });
		},
		onError: () => toast.error("Failed to mark request as sent"),
	});
}

export function useDeletePendingSendRequest(serverId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (requestId: string) =>
			api.sendCommand.deletePendingRequest(requestId),
		onSuccess: () => {
			toast.success("Request deleted");
			qc.invalidateQueries({ queryKey: qk.pending(serverId) });
		},
		onError: () => toast.error("Failed to delete request"),
	});
}