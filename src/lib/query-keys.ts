/**
 * Centralized query key factory for TanStack Query.
 *
 * All query keys follow a hierarchical structure so that invalidating
 * a parent prefix (e.g. queryKeys.factions.all) cascades to every
 * child query underneath it.
 */

export const queryKeys = {
  // ── Users ──
  users: {
    all: ["users"] as const,
    detail: (id: string) => ["users", id] as const,
    me: () => ["users", "me"] as const,
  },

  // ── Factions ──
  factions: {
    all: ["factions"] as const,
    lists: () => [...queryKeys.factions.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.factions.lists(), filters] as const,
    details: () => [...queryKeys.factions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.factions.details(), id] as const,
  },

  // ── Members ──
  members: {
    all: (factionId: string) => ["factions", factionId, "members"] as const,
    list: (factionId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.members.all(factionId), "list", filters] as const,
    detail: (factionId: string, userId: string) =>
      [...queryKeys.members.all(factionId), userId] as const,
  },

  // ── Ranks ──
  ranks: {
    all: (factionId: string) => ["factions", factionId, "ranks"] as const,
    detail: (factionId: string, rankId: string) =>
      [...queryKeys.ranks.all(factionId), rankId] as const,
    permissions: (factionId: string, rankId: string) =>
      [...queryKeys.ranks.detail(factionId, rankId), "permissions"] as const,
  },

  // ── Events ──
  events: {
    all: (factionId: string) => ["factions", factionId, "events"] as const,
    list: (factionId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.events.all(factionId), "list", filters] as const,
    detail: (factionId: string, eventId: string) =>
      [...queryKeys.events.all(factionId), eventId] as const,
    upcoming: (factionId: string) =>
      [...queryKeys.events.all(factionId), "upcoming"] as const,
    requests: (factionId: string, filters?: Record<string, unknown>) =>
      ["factions", factionId, "event-requests", filters] as const,
  },

  // ── Templates ──
  templates: {
    embeds: (factionId: string) =>
      ["factions", factionId, "templates", "embeds"] as const,
    embedDetail: (factionId: string, id: string) =>
      [...queryKeys.templates.embeds(factionId), id] as const,
    containers: (factionId: string) =>
      ["factions", factionId, "templates", "containers"] as const,
    containerDetail: (factionId: string, id: string) =>
      [...queryKeys.templates.containers(factionId), id] as const,
    text: (factionId: string) =>
      ["factions", factionId, "templates", "text"] as const,
    textDetail: (factionId: string, id: string) =>
      [...queryKeys.templates.text(factionId), id] as const,
  },

  // ── Stats ──
  stats: {
    overview: (factionId: string) =>
      ["factions", factionId, "stats"] as const,
    daily: (factionId: string, dateRange?: Record<string, unknown>) =>
      ["factions", factionId, "stats", "daily", dateRange] as const,
    leaderboard: (factionId: string, metric?: string) =>
      ["factions", factionId, "stats", "leaderboard", metric] as const,
  },

  // ── Moderation ──
  moderation: {
    punishments: (factionId: string, filters?: Record<string, unknown>) =>
      ["factions", factionId, "punishments", filters] as const,
    blacklist: (factionId: string) =>
      ["factions", factionId, "blacklist"] as const,
    blacklistConfig: (factionId: string) =>
      ["factions", factionId, "blacklist-config"] as const,
    promoLocks: (factionId: string) =>
      ["factions", factionId, "promo-locks"] as const,
  },

  // ── Points ──
  points: {
    user: (factionId: string, userId: string) =>
      ["factions", factionId, "members", userId, "points"] as const,
    flags: (factionId: string) =>
      ["factions", factionId, "promotion-flags"] as const,
  },

  // ── Units ──
  units: {
    all: (factionId: string) => ["factions", factionId, "units"] as const,
    detail: (factionId: string, unitId: string) =>
      [...queryKeys.units.all(factionId), unitId] as const,
  },

  // ── Billing ──
  billing: {
    subscription: (factionId: string) =>
      ["billing", "subscription", factionId] as const,
  },

  // ── Config ──
  config: {
    faction: (factionId: string) =>
      ["factions", factionId, "config"] as const,
    welcome: (factionId: string) =>
      ["factions", factionId, "welcome"] as const,
    eventTypes: (factionId: string) =>
      ["factions", factionId, "event-types"] as const,
  },

  // ── Permissions (user's own permissions for a faction) ──
  permissions: {
    user: (factionId: string) =>
      ["factions", factionId, "permissions"] as const,
  },

  // ── Promotion Paths ──
  promotionPaths: {
    all: (factionId: string) =>
      ["factions", factionId, "promotion-paths"] as const,
    detail: (factionId: string, pathId: string) =>
      [...queryKeys.promotionPaths.all(factionId), pathId] as const,
  },
} as const;
