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

/** Extended user with server membership context */
export interface UserProfile extends User {
  servers: Array<{
    serverId: string;
    serverName: string;
    rankName: string;
    joinedAt: string;
  }>;
}
