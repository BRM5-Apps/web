import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { EventRequest } from "@/types/event";
import { toast } from "sonner";

export function useEventRequests(serverId: string) {
  return useQuery<EventRequest[]>({
    queryKey: queryKeys.events.requests(serverId),
    queryFn: ({ signal }) => api.eventRequests.list(serverId, { signal }),
    enabled: !!serverId,
  });
}

export function useApproveEventRequest(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      api.eventRequests.approve(serverId, requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.events.requests(serverId) });
      toast.success("Event request approved");
    },
    onError: () => toast.error("Failed to approve request"),
  });
}

export function useDenyEventRequest(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      api.eventRequests.deny(serverId, requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.events.requests(serverId) });
      toast.success("Event request denied");
    },
    onError: () => toast.error("Failed to deny request"),
  });
}
