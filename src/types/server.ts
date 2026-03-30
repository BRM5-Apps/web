// Forward declarations for circular imports - these will be resolved at runtime
// Avoid importing full modules to prevent circular dependencies

export interface Server {
  id: string;
  name: string;
  discordGuildId: string;
  ownerId: string;
  description?: string;
  iconUrl?: string;
  subscriptionTier: "free" | "pro" | "enterprise";
  createdAt: string;
  updatedAt: string;
}

export interface ServerUser {
  id: string;
  serverId: string;
  userId: string;
  rankId?: string;
  currentUnitId?: string;           // Primary unit assignment
  joinedAt: string;
  isActive: boolean;
}

/** Member with joined user + rank data (returned by GET /servers/:id/members) */
export interface ServerMember {
  id: string;
  serverId: string;
  userId: string;
  username: string;
  discordId: string;
  avatarUrl?: string;
  rankId?: string;
  rankName?: string;
  rankColor?: string;
  rankLevel?: number;
  currentUnitId?: string;           // Primary unit assignment
  unitName?: string;                 // Unit name for display
  points: number;
  joinedAt: string;
  lastActiveAt?: string;
  isActive: boolean;
}

/** Member profile with full details (returned by GET /servers/:id/members/:id) */
export interface MemberProfile extends ServerMember {
  nickname?: string;
  currentStatus: string;
  positions: PositionAssignment[];   // Active positions held
  branchProgress: MemberBranchProgress[]; // Progress in branches
  stats: MemberStats;
}

/** Member statistics */
export interface MemberStats {
  messagesSent: number;
  voiceMinutes: number;
  eventsAttended: number;
  eventsHosted: number;
  lastActiveAt?: string;
}

/** Member rank history entry */
export interface MemberRankHistory {
  id: string;
  serverUserId: string;
  oldRankId?: string;
  oldRank?: Rank;
  newRankId: string;
  newRank?: Rank;
  changedById: string;
  changedBy?: ServerMember;
  reason: string;
  createdAt: string;
}

/** Paginated member list response (unwrapped from ApiResponse envelope) */
export interface PaginatedMembers {
  members: ServerMember[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServerConfig {
  id: string;
  serverId: string;
  logChannelId?: string;
  modChannelId?: string;
  eventChannelId?: string;
  timezone: string;
  locale: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Type imports for interfaces - use 'type' to avoid circular dependency issues
import type { PositionAssignment } from './position';
import type { MemberBranchProgress } from './branch';
import type { Rank } from './rank';