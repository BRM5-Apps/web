export interface DiscordGuildRole {
  id: string;
  name: string;
  color: number;
  position: number;
  managed: boolean;
}

export interface DiscordGuildChannel {
  id: string;
  name: string;
  type: number;
  position: number;
  parent_id?: string | null;
}

export interface DiscordGuildUser {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  bot?: boolean;
}

export interface DiscordGuildInventory {
  guild_id: string;
  roles: DiscordGuildRole[];
  channels: DiscordGuildChannel[];
  users: DiscordGuildUser[];
}
