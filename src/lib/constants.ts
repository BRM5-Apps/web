export const APP_NAME = "ServerHub";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

// ── Permission Keys ──

export const PERMISSION_KEYS = {
  SERVER_VIEW: "server.view",
  SERVER_EDIT: "server.edit",
  SERVER_DELETE: "server.delete",
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
  servers: {
    list: "/servers",
    create: "/servers",
    get: (serverId: string) => `/servers/${serverId}`,
    update: (serverId: string) => `/servers/${serverId}`,
    delete: (serverId: string) => `/servers/${serverId}`,
    members: {
      list: (serverId: string) => `/servers/${serverId}/members`,
      kick: (serverId: string) => `/servers/${serverId}/members/kick`,
    },
    permissions: (serverId: string) => `/servers/${serverId}/permissions`,
    config: (serverId: string) => `/servers/${serverId}/config`,
    eventTypes: (serverId: string) => `/servers/${serverId}/event-types`,
    ranks: (serverId: string) => `/servers/${serverId}/ranks`,
    rank: (serverId: string, rankId: string) =>
      `/servers/${serverId}/ranks/${rankId}`,
    promote: (serverId: string) => `/servers/${serverId}/ranks/promote`,
    demote: (serverId: string) => `/servers/${serverId}/ranks/demote`,
    rankPermissions: (serverId: string, rankId: string) =>
      `/servers/${serverId}/ranks/${rankId}/permissions`,
    reorderRanks: (serverId: string) =>
      `/servers/${serverId}/ranks/reorder`,
    promotionPaths: (serverId: string) =>
      `/servers/${serverId}/promotion-paths`,
    promotionPath: (serverId: string, pathId: string) =>
      `/servers/${serverId}/promotion-paths/${pathId}`,
    events: {
      list: (serverId: string) => `/servers/${serverId}/events`,
      create: (serverId: string) => `/servers/${serverId}/events`,
      update: (serverId: string, eventId: string) =>
        `/servers/${serverId}/events/${eventId}`,
      start: (serverId: string, eventId: string) =>
        `/servers/${serverId}/events/${eventId}/start`,
      cancel: (serverId: string, eventId: string) =>
        `/servers/${serverId}/events/${eventId}/cancel`,
      upcoming: (serverId: string) =>
        `/servers/${serverId}/events/upcoming`,
      active: (serverId: string) => `/servers/${serverId}/events/active`,
    },
    eventRequests: {
      list: (serverId: string) => `/servers/${serverId}/event-requests`,
      create: (serverId: string) => `/servers/${serverId}/event-requests`,
      approve: (serverId: string, requestId: string) =>
        `/servers/${serverId}/event-requests/${requestId}/approve`,
      deny: (serverId: string, requestId: string) =>
        `/servers/${serverId}/event-requests/${requestId}/deny`,
    },
    templates: {
      embeds: (serverId: string) => `/servers/${serverId}/embeds`,
      embed: (serverId: string, templateId: string) =>
        `/servers/${serverId}/embeds/${templateId}`,
      containers: (serverId: string) => `/servers/${serverId}/containers`,
      container: (serverId: string, templateId: string) =>
        `/servers/${serverId}/containers/${templateId}`,
      texts: (serverId: string) => `/servers/${serverId}/texts`,
      text: (serverId: string, templateId: string) =>
        `/servers/${serverId}/texts/${templateId}`,
      modals: (serverId: string) => `/servers/${serverId}/modals`,
      modal: (serverId: string, templateId: string) =>
        `/servers/${serverId}/modals/${templateId}`,
    },
    modalElements: {
      list: (serverId: string) => `/servers/${serverId}/modal-elements`,
      listByModal: (serverId: string, modalTemplateId: string) =>
        `/servers/${serverId}/modal-elements/by-modal/${modalTemplateId}`,
      sync: (serverId: string) => `/servers/${serverId}/modal-elements/sync`,
      deleteByModal: (serverId: string, modalTemplateId: string) =>
        `/servers/${serverId}/modal-elements/by-modal/${modalTemplateId}`,
    },
    elements: {
      list: (serverId: string) => `/servers/${serverId}/elements`,
      detail: (serverId: string, key: string) => `/servers/${serverId}/elements/${key}`,
      create: (serverId: string) => `/servers/${serverId}/elements`,
      resolve: (serverId: string) => `/servers/${serverId}/elements/resolve`,
      increment: (serverId: string, key: string) => `/servers/${serverId}/elements/${key}/increment`,
    },
    stats: {
      overview: (serverId: string) => `/servers/${serverId}/stats`,
      daily: (serverId: string) => `/servers/${serverId}/stats/daily`,
      leaderboard: (serverId: string) =>
        `/servers/${serverId}/stats/leaderboard`,
    },
    moderation: {
      punish: (serverId: string) => `/servers/${serverId}/punishments`,
      revoke: (serverId: string, punishmentId: string) =>
        `/servers/${serverId}/punishments/${punishmentId}/revoke`,
      appeal: (serverId: string, punishmentId: string) =>
        `/servers/${serverId}/punishments/${punishmentId}/appeal`,
      appeals: (serverId: string) =>
        `/servers/${serverId}/punishment-appeals`,
      reviewAppeal: (serverId: string, appealId: string) =>
        `/servers/${serverId}/punishment-appeals/${appealId}/review`,
      blacklistConfig: (serverId: string) =>
        `/servers/${serverId}/blacklist-config`,
      notifications: (serverId: string) =>
        `/servers/${serverId}/punishment-notifications`,
      reviewNotification: (serverId: string, notificationId: string) =>
        `/servers/${serverId}/punishment-notifications/${notificationId}/review`,
    },
    points: {
      get: (serverId: string, serverUserId: string) =>
        `/servers/${serverId}/points/${serverUserId}`,
      award: (serverId: string) => `/servers/${serverId}/points/award`,
      deduct: (serverId: string) => `/servers/${serverId}/points/deduct`,
      promotionFlags: (serverId: string) =>
        `/servers/${serverId}/points/promotion-flags`,
      processFlags: (serverId: string) =>
        `/servers/${serverId}/points/promotion-flags/process`,
    },
    units: {
      list: (serverId: string) => `/servers/${serverId}/units`,
      create: (serverId: string) => `/servers/${serverId}/units`,
      update: (serverId: string, unitId: string) =>
        `/servers/${serverId}/units/${unitId}`,
      delete: (serverId: string, unitId: string) =>
        `/servers/${serverId}/units/${unitId}`,
      members: (serverId: string, unitId: string) =>
        `/servers/${serverId}/units/${unitId}/members`,
      addMember: (serverId: string, unitId: string) =>
        `/servers/${serverId}/units/${unitId}/members`,
      removeMember: (
        serverId: string,
        unitId: string,
        serverUserId: string
      ) => `/servers/${serverId}/units/${unitId}/members/${serverUserId}`,
    },
    welcomeConfig: (serverId: string) =>
      `/servers/${serverId}/welcome-config`,
    messageSend: (serverId: string) => `/servers/${serverId}/messages/send`,
    messageQuickSend: (serverId: string) => `/servers/${serverId}/messages/quick-send`,
    messageHistory: (serverId: string) => `/servers/${serverId}/messages/history`,
    schedule: {
      list: (serverId: string) => `/servers/${serverId}/scheduled-messages`,
      detail: (serverId: string, id: string) => `/servers/${serverId}/scheduled-messages/${id}`,
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
