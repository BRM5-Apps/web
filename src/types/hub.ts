export interface ServerHub {
  id: string;
  name: string;
  ownerId: string;
  description?: string;
  iconUrl?: string;
  subscriptionTier: "free" | "pro" | "enterprise";
  createdAt: string;
  updatedAt: string;
}

export interface ServerHubUser {
  id: string;
  hubId: string;
  userId: string;
  rankId?: string;
  joinedAt: string;
  isActive: boolean;
}

export interface ServerHubConfig {
  id: string;
  hubId: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ServerHubStats {
  id: string;
  hubId: string;
  totalServers: number;
  totalMembers: number;
  updatedAt: string;
}
