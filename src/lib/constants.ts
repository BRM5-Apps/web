export const APP_NAME = "FactionHub";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

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
