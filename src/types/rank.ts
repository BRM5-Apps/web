export interface Rank {
  id: string;
  factionId?: string;
  hubId?: string;
  name: string;
  level: number;
  color?: string;
  iconUrl?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RankPermission {
  rankId: string;
  permissionId: string;
}

export interface Permission {
  id: string;
  key: string;
  description: string;
  category: string;
}

/** Payload for creating or updating a rank */
export interface RankPayload {
  name: string;
  level: number;
  color?: string;
  iconUrl?: string;
  isDefault?: boolean;
}

/** Rank enriched with counts for UI display */
export interface RankWithDetails extends Rank {
  memberCount: number;
  permissionCount: number;
  permissions?: Permission[];
}

/** Payload for reordering ranks by swapping levels */
export interface ReorderRanksPayload {
  ranks: Array<{ id: string; level: number }>;
}

/** Promotion path between two ranks */
export interface PromotionPath {
  id: string;
  factionId: string;
  fromRankId: string;
  toRankId: string;
  requiredPoints?: number;
  requiredEvents?: number;
  requiredDays?: number;
  autoPromote: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating/updating a promotion path */
export interface PromotionPathPayload {
  fromRankId: string;
  toRankId: string;
  requiredPoints?: number;
  requiredEvents?: number;
  requiredDays?: number;
  autoPromote?: boolean;
}

export interface RankHistory {
  id: string;
  factionUserId: string;
  oldRankId?: string;
  newRankId?: string;
  changedById: string;
  reason: string;
  createdAt: string;
}
