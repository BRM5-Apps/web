export interface FactionStats {
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  totalPoints: number;
}

export interface UserStats {
  userId: string;
  totalEvents: number;
  totalPoints: number;
  messagesCount: number;
  voiceMinutes: number;
}

export interface DailyStats {
  date: string;
  events: number;
  messages: number;
  voiceMinutes: number;
  activeUsers: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  points: number;
  rank: number;
}
