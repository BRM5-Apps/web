import type { Rank } from './rank';

// RankBranch represents a branch in the rank progression system
export interface RankBranch {
  id: string;
  serverId: string;
  name: string;
  description?: string;
  isExclusive: boolean;          // If true, member can only be on one path in this branch
  discordRoleId?: string;
  color: string;
  order: number;
  paths: BranchPath[];
  createdAt: string;
  updatedAt: string;
}

// BranchPath represents a step in a rank branch progression
export interface BranchPath {
  id: string;
  branchId: string;
  fromRankId: string;
  toRankId: string;
  order: number;
  requiredPoints?: number;
  requiredEvents?: number;
  requiredDays?: number;
  autoPromote: boolean;
  createdAt: string;
  updatedAt: string;
}

// MemberBranchProgress tracks a member's progress within a branch
export interface MemberBranchProgress {
  id: string;
  serverUserId: string;
  branchId: string;
  branch?: RankBranch;
  currentRankId: string;
  currentRank?: Rank;
  joinedAt: string;
  lastPromotedAt?: string;
}

// Payload for creating/updating a branch
export interface BranchPayload {
  name: string;
  description?: string;
  isExclusive: boolean;
  discordRoleId?: string;
  color?: string;
  order?: number;
}

// Payload for updating path order
export interface PathOrderPayload {
  paths: Array<{
    id?: string;          // Optional for new paths
    fromRankId: string;
    toRankId: string;
    order: number;
    requiredPoints?: number;
    requiredEvents?: number;
    requiredDays?: number;
    autoPromote?: boolean;
  }>;
}