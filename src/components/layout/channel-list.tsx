"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ChevronDown,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { serverNavConfig } from "@/config/nav";
import { useServerStore } from "@/stores/server-store";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWebSocket } from "@/hooks/use-websocket";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  hasPermission?: boolean;
}

interface NavCategoryProps {
  label: string;
  children: React.ReactNode;
}

// ─── WebSocket Status Dot ─────────────────────────────────────────────────────

function WsStatusDot() {
  const { status } = useWebSocket();
  const dotClass = {
    connected: "bg-emerald-500",
    connecting: "bg-amber-400 animate-pulse",
    disconnected: "bg-[#949BA4]",
  }[status];

  return (
    <span
      title={`WebSocket: ${status}`}
      className={cn("h-2.5 w-2.5 rounded-full", dotClass)}
    />
  );
}

// ─── Nav Item Component ───────────────────────────────────────────────────────

function NavItem({ href, icon: Icon, label, isActive, hasPermission = true }: NavItemProps) {
  if (!hasPermission) return null;

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2 rounded px-2 py-1.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-[#404249] text-white"
          : "text-[#949BA4] hover:bg-[#35373C] hover:text-[#DBDEE1]"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

// ─── Nav Category Component ─────────────────────────────────────────────────────

function NavCategory({ label, children }: NavCategoryProps) {
  return (
    <div className="mb-4">
      <button className="mb-1 flex w-full items-center gap-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[#949BA4] hover:text-[#DBDEE1]">
        <ChevronDown className="h-3 w-3" />
        {label}
      </button>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

// ─── Server Header Component ────────────────────────────────────────────────────

function ServerHeader() {
  const { activeServer } = useServerStore();

  return (
    <div className="flex h-12 items-center border-b border-[#1F2023] px-4 shadow-sm">
      <div className="flex items-center gap-2 overflow-hidden">
        {activeServer?.iconUrl ? (
          <img
            src={activeServer.iconUrl}
            alt={activeServer.name}
            className="h-6 w-6 flex-shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#5865F2] text-xs font-bold text-white">
            {activeServer?.name?.charAt(0) ?? "S"}
          </div>
        )}
        <h2 className="truncate text-[15px] font-semibold text-white">
          {activeServer?.name ?? "Select Server"}
        </h2>
      </div>
    </div>
  );
}

// ─── User Footer Component ────────────────────────────────────────────────────

function UserFooter() {
  const { user } = useAuth();
  const { activeServerId } = useServerStore();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 border-t border-[#1F2023] bg-[#2B2D31] p-2">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5865F2] text-xs font-bold text-white">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute -bottom-0.5 -right-0.5">
          <WsStatusDot />
        </div>
      </div>

      {/* Username */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium text-white">{user.username}</p>
        <p className="text-xs text-[#949BA4]">Online</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={activeServerId ? `/server/${activeServerId}/settings` : "/select-server"}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#B5BAC1] hover:bg-[#404249] hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>User Settings</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={async () => {
                await fetch("/api/auth/clear", { method: "POST" });
                await signOut({ callbackUrl: "/login" });
              }}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#B5BAC1] hover:bg-[#404249] hover:text-[#F23F43]"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Log Out</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function ChannelList() {
  const pathname = usePathname();
  const { activeServerId } = useServerStore();
  const { hasPermission } = usePermissions(activeServerId ?? "");
  const basePath = activeServerId ? `/server/${activeServerId}` : "";

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="fixed left-[72px] top-0 z-40 flex h-screen w-[240px] flex-col bg-[#2B2D31]">
        {/* Server Header */}
        <ServerHeader />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-3">
          {activeServerId ? (
            serverNavConfig.map((section) => {
              // Filter items by permission
              const visibleItems = section.items.filter(
                (item) => !item.permission || hasPermission(item.permission)
              );

              if (visibleItems.length === 0) return null;

              return (
                <NavCategory key={section.label} label={section.label}>
                  {visibleItems.map((item) => {
                    const fullHref = `${basePath}${item.href}`;
                    const isActive =
                      item.href === ""
                        ? pathname === basePath || pathname === `${basePath}/`
                        : pathname.startsWith(fullHref);

                    return (
                      <NavItem
                        key={item.href}
                        href={fullHref}
                        icon={item.icon}
                        label={item.label}
                        isActive={isActive}
                      />
                    );
                  })}
                </NavCategory>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-[#949BA4]">Select a server to view channels</p>
            </div>
          )}
        </ScrollArea>

        {/* User Footer */}
        <UserFooter />
      </aside>
    </TooltipProvider>
  );
}
