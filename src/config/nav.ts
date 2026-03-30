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
  BarChart3,
  Trophy,
  Settings,
  Handshake,
  CalendarCog,
  ShieldCheck,
  ListChecks,
  CreditCard,
  MessageSquarePlus,
  LayoutTemplate,
  Clock,
  GitBranch,
  BookOpen,
  ShieldQuestion,
  Pin,
  Package,
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

// Top-level navigation (outside server context)
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
      { href: "/server", icon: Shield, label: "Servers" },
    ],
  },
  {
    label: "Help",
    items: [
      { href: "/documentation", icon: BookOpen, label: "Documentation" },
    ],
  },
];

// Server-scoped navigation sections
// hrefs are relative — prepend /server/[serverId] at render time
export const serverNavConfig: NavSection[] = [
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
        href: "/saved-content",
        icon: FileText,
        label: "Saved Content",
        permission: "templates.view",
        children: [
          { href: "/saved-content/embeds", icon: Code, label: "Embeds", permission: "templates.view" },
          { href: "/saved-content/containers", icon: MessageSquare, label: "Containers", permission: "templates.view" },
          { href: "/saved-content/text", icon: FileText, label: "Text", permission: "templates.view" },
          { href: "/saved-content/modals", icon: LayoutTemplate, label: "Modals", permission: "templates.view" },
          { href: "/saved-content/automations", icon: GitBranch, label: "Automations", permission: "templates.view" },
        ],
      },
      { href: "/message-builder", icon: MessageSquarePlus, label: "Message Builder", permission: "templates.view" },
      { href: "/schedule", icon: Clock, label: "Schedule", permission: "templates.view" },
      { href: "/sticky-messages", icon: Pin, label: "Sticky Messages", permission: "templates.view" },
      { href: "/message-kits", icon: Package, label: "Message Kits", permission: "templates.view" },
    ],
  },
  {
    label: "Automation",
    items: [
      { href: "/automations", icon: GitBranch, label: "Automations", permission: "templates.view" },
    ],
  },
  {
    label: "Moderation",
    items: [
      { href: "/moderation", icon: Gavel, label: "Moderation", permission: "moderation.view" },
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
      { href: "/settings/verification", icon: ShieldQuestion, label: "Roblox Verification", permission: "settings.edit" },
    ],
  },
  {
    label: "Billing",
    items: [
      { href: "/billing", icon: CreditCard, label: "Billing", permission: "billing.manage" },
    ],
  },
];
