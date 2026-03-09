export interface Faction {
  id: string;
  name: string;
  discordGuildId: string;
  ownerId: string;
  description?: string;
  iconUrl?: string;
  subscriptionTier: string;
  createdAt: string;
  updatedAt: string;
}

export interface FactionHub {
  id: string;
  name: string;
  ownerId: string;
  description?: string;
  iconUrl?: string;
  subscriptionTier: string;
  createdAt: string;
  updatedAt: string;
}

export interface FactionUser {
  id: string;
  factionId: string;
  userId: string;
  rankId: string;
  joinedAt: string;
  isActive: boolean;
}
