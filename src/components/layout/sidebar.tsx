"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, Menu, ChevronRight } from "lucide-react";
import { factionNavConfig } from "@/config/nav";
import { useFactionStore } from "@/stores/faction-store";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/providers/auth-provider";
import { useWebSocket } from "@/hooks/use-websocket";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── WS status dot ────────────────────────────────────────────────────────────

function WsStatusDot() {
  const { status } = useWebSocket();
  const dotClass = {
    connected: "bg-emerald-500",
    connecting: "bg-amber-400 animate-pulse",
    disconnected: "bg-muted-foreground",
  }[status];
  return (
    // ring-sidebar = sidebar bg color used as gap ring between dot and avatar
    <span
      title={`WebSocket: ${status}`}
      className={cn("absolute bottom-0 right-0 h-2 w-2 rounded-full ring-1 ring-sidebar", dotClass)}
    />
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────

function NavItems({ expanded }: { expanded: boolean }) {
  const pathname = usePathname();
  const { activeFactionId } = useFactionStore();
  const { hasPermission } = usePermissions(activeFactionId ?? "");
  const basePath = activeFactionId ? `/faction/${activeFactionId}` : "";

  return (
    <nav className="flex-1 space-y-0.5 px-2 py-3">
      {factionNavConfig.map((section) => {
        const visibleItems = section.items.filter(
          (item) => !item.permission || hasPermission(item.permission)
        );
        if (visibleItems.length === 0) return null;

        return (
          <div key={section.label}>
            {/* Section label — only visible when expanded */}
            <span
              className={cn(
                "block px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-all duration-150 overflow-hidden whitespace-nowrap",
                expanded ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
              )}
            >
              {section.label}
            </span>

            {visibleItems.map((item) => {
              const fullHref = `${basePath}${item.href}`;
              const isActive =
                item.href === ""
                  ? pathname === basePath || pathname === `${basePath}/`
                  : pathname.startsWith(fullHref);
              const Icon = item.icon;

              // Filter children by permission
              const visibleChildren = item.children
                ? item.children.filter(
                    (child) => !child.permission || hasPermission(child.permission)
                  )
                : [];

              return (
                <div key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={fullHref}
                        className={cn(
                          "flex items-center rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors duration-100",
                          isActive
                            ? "bg-sidebar-accent text-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span
                          className={cn(
                            "overflow-hidden whitespace-nowrap transition-all duration-150",
                            expanded ? "max-w-[200px] opacity-100 ml-2" : "max-w-0 opacity-0"
                          )}
                        >
                          {item.label}
                        </span>
                      </Link>
                    </TooltipTrigger>
                    {!expanded && (
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    )}
                  </Tooltip>

                  {/* Nested children — rendered when expanded */}
                  {visibleChildren.length > 0 && (
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-150",
                        expanded ? "max-h-96" : "max-h-0"
                      )}
                    >
                      {visibleChildren.map((child) => {
                        const childHref = `${basePath}${child.href}`;
                        const isChildActive = pathname.startsWith(childHref);
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.href}
                            href={childHref}
                            className={cn(
                              "flex items-center rounded-md pl-7 pr-3 py-1.5 text-[13px] font-medium transition-colors duration-100",
                              isChildActive
                                ? "bg-sidebar-accent text-foreground"
                                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                            )}
                          >
                            <ChildIcon className="h-4 w-4 flex-shrink-0" />
                            <span
                              className={cn(
                                "overflow-hidden whitespace-nowrap transition-all duration-150",
                                expanded ? "max-w-[200px] opacity-100 ml-2" : "max-w-0 opacity-0"
                              )}
                            >
                              {child.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

// ─── Sidebar content (shared between desktop + mobile Sheet) ─────────────────

function SidebarContent({ expanded }: { expanded: boolean }) {
  const router = useRouter();
  const { activeFaction, activeFactionId } = useFactionStore();
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col">
      {/* Server switcher */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => router.push("/select-server")}
            className="flex items-center gap-2 border-b border-border px-3 py-3 w-full text-left hover:bg-sidebar-accent/60 transition-colors duration-100"
          >
            {/* icon */}
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-muted">
              {activeFaction?.iconUrl ? (
                <img
                  src={activeFaction.iconUrl}
                  alt={activeFaction.name}
                  className="h-8 w-8 rounded-md object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-foreground">
                  {activeFaction?.name?.charAt(0) ?? "B"}
                </span>
              )}
            </div>
            {/* label — only visible when expanded */}
            <span
              className={cn(
                "flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap transition-all duration-150",
                expanded ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
              )}
            >
              <span className="truncate text-[13px] font-semibold text-foreground">
                {activeFaction?.name ?? "Select server"}
              </span>
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
            </span>
          </button>
        </TooltipTrigger>
        {!expanded && (
          <TooltipContent side="right">
            {activeFaction?.name ?? "Select server"}
          </TooltipContent>
        )}
      </Tooltip>

      {/* Nav items */}
      <ScrollArea className="flex-1">
        <NavItems expanded={expanded} />
      </ScrollArea>

      {/* User row */}
      <div className="flex items-center gap-2 border-t border-border px-3 py-3">
        <div className="relative flex-shrink-0">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
              {user?.username?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          )}
          <WsStatusDot />
        </div>

        <span
          className={cn(
            "flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap transition-all duration-150",
            expanded ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
          )}
        >
          <span className="truncate text-[13px] font-medium text-foreground">
            {user?.username ?? ""}
          </span>
          <Link
            href={activeFactionId ? `/faction/${activeFactionId}/settings` : "/select-server"}
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </span>
      </div>
    </div>
  );
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────

function DesktopSidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen flex-col bg-sidebar",
        "transition-[width] duration-150 ease-out md:flex",
        expanded ? "w-56" : "w-14"
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <SidebarContent expanded={expanded} />
    </aside>
  );
}

// ─── Mobile sidebar ───────────────────────────────────────────────────────────

function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-md bg-sidebar text-foreground md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-56 p-0 bg-sidebar border-r border-border">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent expanded={true} />
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function Sidebar() {
  return (
    <TooltipProvider delayDuration={0}>
      <DesktopSidebar />
      <MobileSidebar />
    </TooltipProvider>
  );
}
