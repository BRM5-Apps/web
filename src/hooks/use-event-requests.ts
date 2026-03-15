import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { EventRequest } from "@/types/event";
import { toast } from "sonner";

export function useEventRequests(factionId: string) {
  return useQuery<EventRequest[]>({
    queryKey: queryKeys.events.requests(factionId),
    queryFn: ({ signal }) => api.eventRequests.list(factionId, { signal }),
    enabled: !!factionId,
  });
}

export function useApproveEventRequest(factionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      api.eventRequests.approve(factionId, requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.events.requests(factionId) });
      toast.success("Event request approved");
    },
    onError: () => toast.error("Failed to approve request"),
  });
}

export function useDenyEventRequest(factionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      api.eventRequests.deny(factionId, requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.events.requests(factionId) });
      toast.success("Event request denied");
    },
    onError: () => toast.error("Failed to deny request"),
  });
}
