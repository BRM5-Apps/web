import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

/**
 * Interface for member profile response.
 */
export interface MemberProfileResponse {
  member: {
    id: string;
    userId: string;
    serverId: string;
    rankId?: string;
    rank?: { id: string; name: string };
    joinedAt: string;
    points: number;
    user?: { id: string; discordId: string; username: string; avatarUrl?: string };
  };
  profile: {
    joinedAt: string;
    lastActiveAt?: string;
    totalPoints: number;
    currentRankId?: string;
    currentRank?: { id: string; name: string };
    primaryUnitId?: string;
    primaryUnit?: { id: string; name: string };
  };
}

/**
 * Interface for rank history entry.
 */
export interface RankHistoryEntry {
  id: string;
  fromRankId?: string;
  toRankId: string;
  fromRank?: { id: string; name: string };
  toRank: { id: string; name: string };
  reason?: string;
  changedBy: string;
  changedByUser?: { id: string; username: string };
  createdAt: string;
}

/**
 * Interface for unit history entry.
 */
export interface UnitHistoryEntry {
  id: string;
  fromUnitId?: string;
  toUnitId: string;
  fromUnit?: { id: string; name: string };
  toUnit: { id: string; name: string };
  reason?: string;
  changedBy: string;
  changedByUser?: { id: string; username: string };
  createdAt: string;
}

/**
 * Hook to fetch a member's profile.
 */
export function useMemberProfile(
  serverId: string,
  serverUserId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<MemberProfileResponse>({
    queryKey: queryKeys.memberProfile.detail(serverId, serverUserId),
    queryFn: ({ signal }) =>
      api.memberProfile.get(serverId, serverUserId, { signal }),
    enabled: options?.enabled ?? (!!serverId && !!serverUserId),
  });
}

/**
 * Hook to fetch a member's rank history.
 */
export function useMemberRankHistory(
  serverId: string,
  serverUserId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<RankHistoryEntry[]>({
    queryKey: queryKeys.memberProfile.rankHistory(serverId, serverUserId),
    queryFn: ({ signal }) =>
      api.memberProfile.getRankHistory(serverId, serverUserId, { signal }),
    enabled: options?.enabled ?? (!!serverId && !!serverUserId),
  });
}

/**
 * Hook to fetch a member's unit history.
 */
export function useMemberUnitHistory(
  serverId: string,
  serverUserId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<UnitHistoryEntry[]>({
    queryKey: queryKeys.memberProfile.unitHistory(serverId, serverUserId),
    queryFn: ({ signal }) =>
      api.memberProfile.getUnitHistory(serverId, serverUserId, { signal }),
    enabled: options?.enabled ?? (!!serverId && !!serverUserId),
  });
}