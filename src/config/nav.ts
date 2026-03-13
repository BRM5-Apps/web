import {
  LayoutDashboard,
  Shield,
  Users,
  Calendar,
  CalendarCheck,
  FileText,
  Code,
  MessageSquare,
  Gavel,
  Ban,
  Lock,
  BarChart3,
  Trophy,
  Settings,
  Handshake,
  CalendarCog,
  ShieldCheck,
  ListChecks,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export interface NavItemConfig {
  href: string;
  icon: LucideIcon;
  label: string;
  permission?: string;
  badge?: string;
  children?: NavItemConfig[];
}

export interface NavSection {
  label: string;
  items: NavItemConfig[];
}

// Top-level navigation (outside faction context)
export const navConfig: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/faction", icon: Shield, label: "Factions" },
    ],
  },
];

// Faction-scoped navigation sections
// hrefs are relative — prepend /faction/[factionId] at render time
export const factionNavConfig: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/members", icon: Users, label: "Members", permission: "members.view" },
      { href: "/ranks", icon: Shield, label: "Ranks", permission: "ranks.view" },
      { href: "/units", icon: ShieldCheck, label: "Units", permission: "members.view" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/events", icon: Calendar, label: "Events", permission: "events.view" },
      { href: "/event-requests", icon: CalendarCheck, label: "Event Requests", permission: "events.request" },
      {
        href: "/templates",
        icon: FileText,
        label: "Templates",
        permission: "templates.view",
        children: [
          { href: "/templates/embeds", icon: Code, label: "Embeds", permission: "templates.view" },
          { href: "/templates/containers", icon: MessageSquare, label: "Containers", permission: "templates.view" },
          { href: "/templates/texts", icon: FileText, label: "Text", permission: "templates.view" },
        ],
      },
    ],
  },
  {
    label: "Moderation",
    items: [
      { href: "/moderation/punishments", icon: Gavel, label: "Punishments", permission: "moderation.view" },
      { href: "/moderation/blacklist", icon: Ban, label: "Blacklist", permission: "moderation.view" },
      { href: "/moderation/promo-locks", icon: Lock, label: "Promo Locks", permission: "moderation.view" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/stats", icon: BarChart3, label: "Stats", permission: "stats.view" },
      { href: "/leaderboard", icon: Trophy, label: "Leaderboard", permission: "stats.view" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/settings", icon: Settings, label: "General", permission: "settings.view" },
      { href: "/settings/welcome", icon: Handshake, label: "Welcome", permission: "settings.edit" },
      { href: "/settings/events", icon: CalendarCog, label: "Events Config", permission: "settings.edit" },
      { href: "/settings/permissions", icon: ShieldCheck, label: "Permissions", permission: "settings.edit" },
      { href: "/settings/blacklist", icon: ListChecks, label: "Blacklist Config", permission: "settings.edit" },
    ],
  },
  {
    label: "Billing",
    items: [
      { href: "/billing", icon: CreditCard, label: "Billing", permission: "billing.manage" },
    ],
  },
];
