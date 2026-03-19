import { PERMISSION_KEYS } from "@/lib/constants";

/** Permission category definitions for the settings UI */
export const permissionCategories = [
  {
    label: "Server",
    permissions: [
      PERMISSION_KEYS.SERVER_VIEW,
      PERMISSION_KEYS.SERVER_EDIT,
      PERMISSION_KEYS.SERVER_DELETE,
    ],
  },
  {
    label: "Members",
    permissions: [
      PERMISSION_KEYS.MEMBERS_VIEW,
      PERMISSION_KEYS.MEMBERS_MANAGE,
      PERMISSION_KEYS.MEMBERS_PROMOTE,
      PERMISSION_KEYS.MEMBERS_DEMOTE,
      PERMISSION_KEYS.MEMBERS_KICK,
    ],
  },
  {
    label: "Ranks",
    permissions: [
      PERMISSION_KEYS.RANKS_VIEW,
      PERMISSION_KEYS.RANKS_MANAGE,
      PERMISSION_KEYS.RANKS_ASSIGN,
    ],
  },
  {
    label: "Events",
    permissions: [
      PERMISSION_KEYS.EVENTS_VIEW,
      PERMISSION_KEYS.EVENTS_CREATE,
      PERMISSION_KEYS.EVENTS_MANAGE,
      PERMISSION_KEYS.EVENTS_HOST,
      PERMISSION_KEYS.EVENTS_REQUEST,
    ],
  },
  {
    label: "Templates",
    permissions: [
      PERMISSION_KEYS.TEMPLATES_VIEW,
      PERMISSION_KEYS.TEMPLATES_CREATE,
      PERMISSION_KEYS.TEMPLATES_MANAGE,
    ],
  },
  {
    label: "Moderation",
    permissions: [
      PERMISSION_KEYS.MODERATION_VIEW,
      PERMISSION_KEYS.MODERATION_WARN,
      PERMISSION_KEYS.MODERATION_MUTE,
      PERMISSION_KEYS.MODERATION_KICK,
      PERMISSION_KEYS.MODERATION_BAN,
      PERMISSION_KEYS.MODERATION_MANAGE,
    ],
  },
  {
    label: "Settings",
    permissions: [
      PERMISSION_KEYS.SETTINGS_VIEW,
      PERMISSION_KEYS.SETTINGS_EDIT,
    ],
  },
  {
    label: "Stats",
    permissions: [PERMISSION_KEYS.STATS_VIEW],
  },
  {
    label: "Billing",
    permissions: [
      PERMISSION_KEYS.BILLING_VIEW,
      PERMISSION_KEYS.BILLING_MANAGE,
    ],
  },
];
