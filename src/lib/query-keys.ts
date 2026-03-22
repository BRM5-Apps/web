/**
 * Centralized query key factory for TanStack Query.
 *
 * All query keys follow a hierarchical structure so that invalidating
 * a parent prefix (e.g. queryKeys.servers.all) cascades to every
 * child query underneath it.
 */

export const queryKeys = {
  // ── Users ──
  users: {
    all: ["users"] as const,
    detail: (id: string) => ["users", id] as const,
    me: () => ["users", "me"] as const,
  },

  // ── Servers ──
  servers: {
    all: ["servers"] as const,
    lists: () => [...queryKeys.servers.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.servers.lists(), filters] as const,
    details: () => [...queryKeys.servers.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.servers.details(), id] as const,
  },

  // ── Members ──
  members: {
    all: (serverId: string) => ["servers", serverId, "members"] as const,
    list: (serverId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.members.all(serverId), "list", filters] as const,
    detail: (serverId: string, userId: string) =>
      [...queryKeys.members.all(serverId), userId] as const,
  },

  // ── Ranks ──
  ranks: {
    all: (serverId: string) => ["servers", serverId, "ranks"] as const,
    detail: (serverId: string, rankId: string) =>
      [...queryKeys.ranks.all(serverId), rankId] as const,
    permissions: (serverId: string, rankId: string) =>
      [...queryKeys.ranks.detail(serverId, rankId), "permissions"] as const,
  },

  // ── Events ──
  events: {
    all: (serverId: string) => ["servers", serverId, "events"] as const,
    list: (serverId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.events.all(serverId), "list", filters] as const,
    detail: (serverId: string, eventId: string) =>
      [...queryKeys.events.all(serverId), eventId] as const,
    upcoming: (serverId: string) =>
      [...queryKeys.events.all(serverId), "upcoming"] as const,
    requests: (serverId: string, filters?: Record<string, unknown>) =>
      ["servers", serverId, "event-requests", filters] as const,
  },

  // ── Templates ──
  templates: {
    embeds: (serverId: string) =>
      ["servers", serverId, "templates", "embeds"] as const,
    embedDetail: (serverId: string, id: string) =>
      [...queryKeys.templates.embeds(serverId), id] as const,
    containers: (serverId: string) =>
      ["servers", serverId, "templates", "containers"] as const,
    containerDetail: (serverId: string, id: string) =>
      [...queryKeys.templates.containers(serverId), id] as const,
    text: (serverId: string) =>
      ["servers", serverId, "templates", "text"] as const,
    textDetail: (serverId: string, id: string) =>
      [...queryKeys.templates.text(serverId), id] as const,
  },

  // ── Stats ──
  stats: {
    overview: (serverId: string) =>
      ["servers", serverId, "stats"] as const,
    daily: (serverId: string, dateRange?: Record<string, unknown>) =>
      ["servers", serverId, "stats", "daily", dateRange] as const,
    leaderboard: (serverId: string, metric?: string) =>
      ["servers", serverId, "stats", "leaderboard", metric] as const,
  },

  // ── Moderation ──
  moderation: {
    punishments: (serverId: string, filters?: Record<string, unknown>) =>
      ["servers", serverId, "punishments", filters] as const,
    blacklist: (serverId: string) =>
      ["servers", serverId, "blacklist"] as const,
    blacklistConfig: (serverId: string) =>
      ["servers", serverId, "blacklist-config"] as const,
    promoLocks: (serverId: string) =>
      ["servers", serverId, "promo-locks"] as const,
  },

  // ── Points ──
  points: {
    user: (serverId: string, userId: string) =>
      ["servers", serverId, "members", userId, "points"] as const,
    flags: (serverId: string) =>
      ["servers", serverId, "promotion-flags"] as const,
  },

  // ── Units ──
  units: {
    all: (serverId: string) => ["servers", serverId, "units"] as const,
    detail: (serverId: string, unitId: string) =>
      [...queryKeys.units.all(serverId), unitId] as const,
  },

  // ── Discord Guilds (admin guilds + server status) ──
  discordGuilds: {
    adminGuilds: () => ["discord", "guilds", "admin"] as const,
    serversByGuildIds: (guildIds: string[]) =>
      ["servers", "by-guild-ids", guildIds] as const,
  },

  // ── Billing ──
  billing: {
    subscription: (serverId: string) =>
      ["billing", "subscription", serverId] as const,
  },

  // ── Config ──
  config: {
    server: (serverId: string) =>
      ["servers", serverId, "config"] as const,
    welcome: (serverId: string) =>
      ["servers", serverId, "welcome"] as const,
    eventTypes: (serverId: string) =>
      ["servers", serverId, "event-types"] as const,
  },

  // ── Permissions (user's own permissions for a server) ──
  permissions: {
    user: (serverId: string) =>
      ["servers", serverId, "permissions"] as const,
  },

  // ── Messages (send to Discord) ──
  messages: {
    history: (serverId: string) =>
      ["servers", serverId, "messages", "history"] as const,
  },

  // ── Promotion Paths ──
  promotionPaths: {
    all: (serverId: string) =>
      ["servers", serverId, "promotion-paths"] as const,
    detail: (serverId: string, pathId: string) =>
      [...queryKeys.promotionPaths.all(serverId), pathId] as const,
  },

  // ── Platform Extensions ──
  webhookTriggers: {
    all: (serverId: string) => ["servers", serverId, "webhook-triggers"] as const,
    detail: (serverId: string, triggerId: string) =>
      [...queryKeys.webhookTriggers.all(serverId), triggerId] as const,
    history: (serverId: string, triggerId: string) =>
      [...queryKeys.webhookTriggers.detail(serverId, triggerId), "history"] as const,
  },

  scheduledSequences: {
    all: (serverId: string) => ["servers", serverId, "scheduled-sequences"] as const,
    detail: (serverId: string, sequenceId: string) =>
      [...queryKeys.scheduledSequences.all(serverId), sequenceId] as const,
    history: (serverId: string, sequenceId: string) =>
      [...queryKeys.scheduledSequences.detail(serverId, sequenceId), "history"] as const,
  },

  multiStepModules: {
    all: (serverId: string) => ["servers", serverId, "multi-step-modules"] as const,
    detail: (serverId: string, moduleId: string) =>
      [...queryKeys.multiStepModules.all(serverId), moduleId] as const,
    sessions: (serverId: string, moduleId: string) =>
      [...queryKeys.multiStepModules.detail(serverId, moduleId), "sessions"] as const,
  },

  analytics: {
    events: (serverId: string, filters?: Record<string, unknown>) =>
      ["servers", serverId, "analytics", "events", filters] as const,
    dashboard: (serverId: string) =>
      ["servers", serverId, "analytics", "dashboard"] as const,
    summary: (serverId: string, dateRange?: Record<string, unknown>) =>
      ["servers", serverId, "analytics", "summary", dateRange] as const,
    userActivity: (serverId: string, userId: string) =>
      ["servers", serverId, "analytics", "users", userId, "activity"] as const,
    topEvents: (serverId: string) =>
      ["servers", serverId, "analytics", "top-events"] as const,
    metrics: (serverId: string, metricType: string) =>
      ["servers", serverId, "analytics", "metrics", metricType] as const,
  },

  marketplace: {
    templates: (filters?: Record<string, unknown>) =>
      ["marketplace", "templates", filters] as const,
    featured: () => ["marketplace", "featured"] as const,
    detail: (templateId: string) =>
      ["marketplace", "templates", templateId] as const,
    ratings: (templateId: string) =>
      ["marketplace", "templates", templateId, "ratings"] as const,
    myRating: (templateId: string) =>
      ["marketplace", "templates", templateId, "my-rating"] as const,
    stats: (templateId: string) =>
      ["marketplace", "templates", templateId, "stats"] as const,
    importHistory: (serverId: string) =>
      ["servers", serverId, "marketplace", "import-history"] as const,
    myTemplates: () => ["marketplace", "my-templates"] as const,
  },
} as const;
