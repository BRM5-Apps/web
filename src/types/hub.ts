export interface FactionHub {
  id: string;
  name: string;
  ownerId: string;
  description?: string;
  iconUrl?: string;
  subscriptionTier: "free" | "pro" | "enterprise";
  createdAt: string;
  updatedAt: string;
}

export interface FactionHubUser {
  id: string;
  hubId: string;
  userId: string;
  rankId?: string;
  joinedAt: string;
  isActive: boolean;
}

export interface FactionHubConfig {
  id: string;
  hubId: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface FactionHubStats {
  id: string;
  hubId: string;
  totalFactions: number;
  totalMembers: number;
  updatedAt: string;
}
