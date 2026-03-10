export interface Punishment {
  id: string;
  factionId: string;
  userId: string;
  type: "warn" | "mute" | "kick" | "ban";
  reason: string;
  issuedById: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PunishmentAppeal {
  id: string;
  punishmentId: string;
  userId: string;
  appealText: string;
  status: "pending" | "approved" | "denied" | "escalated";
  reviewedById?: string;
  reviewedAt?: string;
  reviewNote?: string;
  escalatedTo?: "faction_hub" | "pl5";
  createdAt: string;
  updatedAt: string;
}

export interface BlacklistEntry {
  id: string;
  discordId: string;
  reason: string;
  addedById: string;
  createdAt: string;
}

export interface BlacklistConfig {
  id: string;
  factionId: string;
  enabled: boolean;
  action: "notify" | "block" | "auto_ban";
  notifyChannelId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromoLock {
  id: string;
  factionUserId: string;
  lockedById: string;
  reason: string;
  expiresAt?: string;
  createdAt: string;
}
