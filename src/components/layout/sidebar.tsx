"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Menu, ChevronDown } from "lucide-react";
import { useState } from "react";
import { factionNavConfig, type NavItemConfig } from "@/config/nav";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useFactionStore } from "@/stores/faction-store";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FactionSwitcher } from "./faction-switcher";

function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { activeFactionId } = useFactionStore();
  const { hasPermission } = usePermissions(activeFactionId ?? "");

  const basePath = activeFactionId ? `/faction/${activeFactionId}` : "";

  return (
    <nav className="flex-1 space-y-1 p-3">
      {factionNavConfig.map((section) => {
        const visibleItems = section.items.filter(
          (item) => !item.permission || hasPermission(item.permission)
        );
        if (visibleItems.length === 0) return null;

        return (
          <div key={section.label} className="space-y-1">
            {!collapsed && (
              <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
            )}
            {collapsed && <Separator className="my-2" />}
            {visibleItems.map((item) => (
              <SidebarNavItem
                key={item.href}
                item={item}
                basePath={basePath}
                pathname={pathname}
                collapsed={collapsed}
                hasPermission={hasPermission}
              />
            ))}
          </div>
        );
      })}
    </nav>
  );
}

function SidebarNavItem({
  item,
  basePath,
  pathname,
  collapsed,
  hasPermission,
}: {
  item: NavItemConfig;
  basePath: string;
  pathname: string;
  collapsed: boolean;
  hasPermission: (key: string) => boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const fullHref = `${basePath}${item.href}`;
  const isActive = item.href === ""
    ? pathname === basePath || pathname === `${basePath}/`
    : pathname.startsWith(fullHref);
  const Icon = item.icon;

  const hasChildren = item.children && item.children.length > 0;

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={fullHref}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground mx-auto",
              isActive && "bg-accent text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "nav-link w-full justify-between",
            isActive && "nav-link-active"
          )}
        >
          <span className="flex items-center gap-3">
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </span>
          <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
        </button>
        {expanded && (
          <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
            {item.children!
              .filter((child) => !child.permission || hasPermission(child.permission))
              .map((child) => {
                const childHref = `${basePath}${child.href}`;
                const childActive = pathname.startsWith(childHref);
                const ChildIcon = child.icon;
                return (
                  <Link
                    key={child.href}
                    href={childHref}
                    className={cn("nav-link", childActive && "nav-link-active")}
                  >
                    <ChildIcon className="h-3.5 w-3.5" />
                    <span>{child.label}</span>
                  </Link>
                );
              })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={fullHref} className={cn("nav-link", isActive && "nav-link-active")}>
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
      {item.badge && (
        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const { activeFaction } = useFactionStore();
  const { isCollapsed, toggle } = useSidebarStore();

  return (
    <>
      {/* Faction header */}
      <div className={cn(
        "flex h-[var(--header-height)] items-center border-b",
        collapsed ? "justify-center px-2" : "gap-2 px-4"
      )}>
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                {activeFaction?.iconUrl ? (
                  <img
                    src={activeFaction.iconUrl}
                    alt={activeFaction.name}
                    className="h-6 w-6 rounded"
                  />
                ) : (
                  <span className="text-xs font-bold text-primary">
                    {activeFaction?.name?.charAt(0) ?? "F"}
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">{activeFaction?.name ?? "BRM5"}</TooltipContent>
          </Tooltip>
        ) : (
          <>
            <Image src="/images/logo.svg" alt="BRM5" width={28} height={28} />
            <span className="font-semibold text-sidebar-foreground truncate">
              {activeFaction?.name ?? "BRM5"}
            </span>
          </>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <SidebarNav collapsed={collapsed} />
      </ScrollArea>

      {/* Bottom section */}
      <div className="border-t p-3 space-y-2">
        {!collapsed && <FactionSwitcher />}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={toggle}
          className={cn("w-full", collapsed && "mx-auto")}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </>
  );
}

export function Sidebar() {
  const { isCollapsed } = useSidebarStore();

  return (
    <TooltipProvider>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r bg-sidebar transition-[width] duration-300 md:flex",
          isCollapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
        )}
      >
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <MobileSidebar />
      </div>
    </TooltipProvider>
  );
}

function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-3 z-40 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[var(--sidebar-width)] p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex h-full flex-col">
          <SidebarContent collapsed={false} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
