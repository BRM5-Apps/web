import {
  LayoutDashboard,
  Shield,
  Users,
  Calendar,
  FileText,
  Gavel,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavSection {
  label: string;
  items: NavItemConfig[];
}

export interface NavItemConfig {
  href: string;
  icon: LucideIcon;
  label: string;
  permission?: string;
}

// Static navigation — faction-specific routes are built dynamically
// by prepending /faction/[factionId]
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

// Sub-nav items used inside a faction/hub context
export const factionSubNav: NavItemConfig[] = [
  { href: "", icon: LayoutDashboard, label: "Overview" },
  { href: "/ranks", icon: Shield, label: "Ranks", permission: "ranks.view" },
  { href: "/members", icon: Users, label: "Members", permission: "members.view" },
  { href: "/events", icon: Calendar, label: "Events", permission: "events.view" },
  { href: "/templates", icon: FileText, label: "Templates", permission: "templates.view" },
  { href: "/moderation", icon: Gavel, label: "Moderation", permission: "moderation.view" },
  { href: "/stats", icon: BarChart3, label: "Stats", permission: "stats.view" },
  { href: "/settings", icon: Settings, label: "Settings", permission: "settings.view" },
];
