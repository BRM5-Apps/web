export interface User {
  id: string;
  discordId: string;
  username: string;
  avatarUrl?: string;
  globalRole: "user" | "admin";
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

/** Extended user with faction membership context */
export interface UserProfile extends User {
  factions: Array<{
    factionId: string;
    factionName: string;
    rankName: string;
    joinedAt: string;
  }>;
}
