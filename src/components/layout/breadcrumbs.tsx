"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useServerStore } from "@/stores/server-store";
import { cn } from "@/lib/utils";

const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  server: "Servers",
  members: "Members",
  ranks: "Ranks",
  units: "Units",
  events: "Events",
  "event-requests": "Event Requests",
  templates: "Templates",
  embeds: "Embeds",
  containers: "Containers",
  texts: "Text",
  moderation: "Moderation",
  punishments: "Punishments",
  blacklist: "Blacklist",
  "promo-locks": "Promo Locks",
  stats: "Stats",
  leaderboard: "Leaderboard",
  settings: "Settings",
  welcome: "Welcome",
  permissions: "Permissions",
  billing: "Billing",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const { activeServer } = useServerStore();

  const segments = pathname.split("/").filter(Boolean);

  const crumbs: { label: string; href: string }[] = [];
  let hrefAccumulator = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    hrefAccumulator += `/${segment}`;

    // Skip server IDs — replace with server name
    if (segments[i - 1] === "server" && segment !== "server") {
      crumbs.push({
        label: activeServer?.name ?? "Server",
        href: hrefAccumulator,
      });
      continue;
    }

    const label = segmentLabels[segment] ?? segment;
    crumbs.push({ label, href: hrefAccumulator });
  }

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
