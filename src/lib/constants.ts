export const APP_NAME = "FactionHub";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

// ── Permission Keys ──

export const PERMISSION_KEYS = {
  FACTION_VIEW: "faction.view",
  FACTION_EDIT: "faction.edit",
  FACTION_DELETE: "faction.delete",
  MEMBERS_VIEW: "members.view",
  MEMBERS_MANAGE: "members.manage",
  MEMBERS_PROMOTE: "members.promote",
  MEMBERS_DEMOTE: "members.demote",
  MEMBERS_KICK: "members.kick",
  RANKS_VIEW: "ranks.view",
  RANKS_MANAGE: "ranks.manage",
  RANKS_ASSIGN: "ranks.assign",
  EVENTS_VIEW: "events.view",
  EVENTS_CREATE: "events.create",
  EVENTS_MANAGE: "events.manage",
  EVENTS_HOST: "events.host",
  EVENTS_REQUEST: "events.request",
  TEMPLATES_VIEW: "templates.view",
  TEMPLATES_CREATE: "templates.create",
  TEMPLATES_MANAGE: "templates.manage",
  MODERATION_VIEW: "moderation.view",
  MODERATION_WARN: "moderation.warn",
  MODERATION_MUTE: "moderation.mute",
  MODERATION_KICK: "moderation.kick",
  MODERATION_BAN: "moderation.ban",
  MODERATION_MANAGE: "moderation.manage",
  SETTINGS_VIEW: "settings.view",
  SETTINGS_EDIT: "settings.edit",
  STATS_VIEW: "stats.view",
  BILLING_VIEW: "billing.view",
  BILLING_MANAGE: "billing.manage",
} as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];

// ── Domain Constants ──

export const EVENT_STATUSES = {
  SCHEDULED: "scheduled",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type EventStatus = (typeof EVENT_STATUSES)[keyof typeof EVENT_STATUSES];

export const PUNISHMENT_TYPES = {
  WARN: "warn",
  MUTE: "mute",
  KICK: "kick",
  BAN: "ban",
} as const;

export type PunishmentType =
  (typeof PUNISHMENT_TYPES)[keyof typeof PUNISHMENT_TYPES];

export const POINT_SOURCES = {
  EVENT: "event",
  MANUAL: "manual",
  BONUS: "bonus",
  DEDUCTION: "deduction",
} as const;

export type PointSource = (typeof POINT_SOURCES)[keyof typeof POINT_SOURCES];

export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export type SubscriptionTier =
  (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS];

export const TIER_LIMITS = {
  free: {
    maxMembers: 50,
    maxEventTypes: 3,
    maxHubs: 0,
    templateAccess: false,
    hubAccess: false,
    prioritySupport: false,
  },
  pro: {
    maxMembers: 500,
    maxEventTypes: -1,
    maxHubs: 1,
    templateAccess: true,
    hubAccess: true,
    prioritySupport: false,
  },
  enterprise: {
    maxMembers: -1,
    maxEventTypes: -1,
    maxHubs: -1,
    templateAccess: true,
    hubAccess: true,
    prioritySupport: true,
  },
} as const;

// ── API Route Helpers ──

export const API_ROUTES = {
  auth: {
    discord: "/auth/discord",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
  users: {
    get: (userId: string) => `/users/${userId}`,
    update: (userId: string) => `/users/${userId}`,
  },
  factions: {
    list: "/factions",
    create: "/factions",
    get: (factionId: string) => `/factions/${factionId}`,
    update: (factionId: string) => `/factions/${factionId}`,
    delete: (factionId: string) => `/factions/${factionId}`,
    members: {
      list: (factionId: string) => `/factions/${factionId}/members`,
      kick: (factionId: string) => `/factions/${factionId}/members/kick`,
    },
    permissions: (factionId: string) => `/factions/${factionId}/permissions`,
    config: (factionId: string) => `/factions/${factionId}/config`,
    eventTypes: (factionId: string) => `/factions/${factionId}/event-types`,
    ranks: (factionId: string) => `/factions/${factionId}/ranks`,
    rank: (factionId: string, rankId: string) =>
      `/factions/${factionId}/ranks/${rankId}`,
    promote: (factionId: string) => `/factions/${factionId}/ranks/promote`,
    demote: (factionId: string) => `/factions/${factionId}/ranks/demote`,
    rankPermissions: (factionId: string, rankId: string) =>
      `/factions/${factionId}/ranks/${rankId}/permissions`,
    reorderRanks: (factionId: string) =>
      `/factions/${factionId}/ranks/reorder`,
    promotionPaths: (factionId: string) =>
      `/factions/${factionId}/promotion-paths`,
    promotionPath: (factionId: string, pathId: string) =>
      `/factions/${factionId}/promotion-paths/${pathId}`,
    events: {
      list: (factionId: string) => `/factions/${factionId}/events`,
      create: (factionId: string) => `/factions/${factionId}/events`,
      update: (factionId: string, eventId: string) =>
        `/factions/${factionId}/events/${eventId}`,
      start: (factionId: string, eventId: string) =>
        `/factions/${factionId}/events/${eventId}/start`,
      cancel: (factionId: string, eventId: string) =>
        `/factions/${factionId}/events/${eventId}/cancel`,
      upcoming: (factionId: string) =>
        `/factions/${factionId}/events/upcoming`,
      active: (factionId: string) => `/factions/${factionId}/events/active`,
    },
    eventRequests: {
      list: (factionId: string) => `/factions/${factionId}/event-requests`,
      create: (factionId: string) => `/factions/${factionId}/event-requests`,
      approve: (factionId: string, requestId: string) =>
        `/factions/${factionId}/event-requests/${requestId}/approve`,
      deny: (factionId: string, requestId: string) =>
        `/factions/${factionId}/event-requests/${requestId}/deny`,
    },
    templates: {
      embeds: (factionId: string) => `/factions/${factionId}/embeds`,
      embed: (factionId: string, templateId: string) =>
        `/factions/${factionId}/embeds/${templateId}`,
      containers: (factionId: string) => `/factions/${factionId}/containers`,
      container: (factionId: string, templateId: string) =>
        `/factions/${factionId}/containers/${templateId}`,
      texts: (factionId: string) => `/factions/${factionId}/texts`,
      text: (factionId: string, templateId: string) =>
        `/factions/${factionId}/texts/${templateId}`,
      modals: (factionId: string) => `/factions/${factionId}/modals`,
      modal: (factionId: string, templateId: string) =>
        `/factions/${factionId}/modals/${templateId}`,
    },
    stats: {
      overview: (factionId: string) => `/factions/${factionId}/stats`,
      daily: (factionId: string) => `/factions/${factionId}/stats/daily`,
      leaderboard: (factionId: string) =>
        `/factions/${factionId}/stats/leaderboard`,
    },
    moderation: {
      punish: (factionId: string) => `/factions/${factionId}/punishments`,
      revoke: (factionId: string, punishmentId: string) =>
        `/factions/${factionId}/punishments/${punishmentId}/revoke`,
      appeal: (factionId: string, punishmentId: string) =>
        `/factions/${factionId}/punishments/${punishmentId}/appeal`,
      appeals: (factionId: string) =>
        `/factions/${factionId}/punishment-appeals`,
      reviewAppeal: (factionId: string, appealId: string) =>
        `/factions/${factionId}/punishment-appeals/${appealId}/review`,
      blacklistConfig: (factionId: string) =>
        `/factions/${factionId}/blacklist-config`,
      notifications: (factionId: string) =>
        `/factions/${factionId}/punishment-notifications`,
      reviewNotification: (factionId: string, notificationId: string) =>
        `/factions/${factionId}/punishment-notifications/${notificationId}/review`,
    },
    points: {
      get: (factionId: string, factionUserId: string) =>
        `/factions/${factionId}/points/${factionUserId}`,
      award: (factionId: string) => `/factions/${factionId}/points/award`,
      deduct: (factionId: string) => `/factions/${factionId}/points/deduct`,
      promotionFlags: (factionId: string) =>
        `/factions/${factionId}/points/promotion-flags`,
      processFlags: (factionId: string) =>
        `/factions/${factionId}/points/promotion-flags/process`,
    },
    units: {
      list: (factionId: string) => `/factions/${factionId}/units`,
      create: (factionId: string) => `/factions/${factionId}/units`,
      update: (factionId: string, unitId: string) =>
        `/factions/${factionId}/units/${unitId}`,
      delete: (factionId: string, unitId: string) =>
        `/factions/${factionId}/units/${unitId}`,
      members: (factionId: string, unitId: string) =>
        `/factions/${factionId}/units/${unitId}/members`,
      addMember: (factionId: string, unitId: string) =>
        `/factions/${factionId}/units/${unitId}/members`,
      removeMember: (
        factionId: string,
        unitId: string,
        factionUserId: string
      ) => `/factions/${factionId}/units/${unitId}/members/${factionUserId}`,
    },
    welcomeConfig: (factionId: string) =>
      `/factions/${factionId}/welcome-config`,
    messageSend: (factionId: string) => `/factions/${factionId}/messages/send`,
    messageHistory: (factionId: string) => `/factions/${factionId}/messages/history`,
    schedule: {
      list: (factionId: string) => `/factions/${factionId}/scheduled-messages`,
      detail: (factionId: string, id: string) => `/factions/${factionId}/scheduled-messages/${id}`,
    },
  },
  billing: {
    subscription: "/billing/subscription",
    checkout: "/billing/checkout",
  },
  blacklist: {
    get: (discordId: string) => `/blacklist/${discordId}`,
    create: "/blacklist",
    delete: (discordId: string) => `/blacklist/${discordId}`,
  },
} as const;
