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
