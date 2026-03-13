export interface Faction {
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

export interface FactionUser {
  id: string;
  factionId: string;
  userId: string;
  rankId?: string;
  joinedAt: string;
  isActive: boolean;
}

/** Member with joined user + rank data (returned by GET /factions/:id/members) */
export interface FactionMember {
  id: string;
  factionId: string;
  userId: string;
  username: string;
  discordId: string;
  avatarUrl?: string;
  rankId?: string;
  rankName?: string;
  rankColor?: string;
  rankLevel?: number;
  points: number;
  joinedAt: string;
  lastActiveAt?: string;
  isActive: boolean;
}

/** Paginated member list response (unwrapped from ApiResponse envelope) */
export interface PaginatedMembers {
  members: FactionMember[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FactionConfig {
  id: string;
  factionId: string;
  logChannelId?: string;
  modChannelId?: string;
  eventChannelId?: string;
  timezone: string;
  locale: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
