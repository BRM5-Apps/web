"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Home, BookOpen } from "lucide-react";
import type { GuildWithServerStatus } from "@/hooks/use-admin-guilds";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServerIconProps {
  guild: GuildWithServerStatus;
  isActive: boolean;
  onSelect: (guild: GuildWithServerStatus) => void;
}

// ─── Server Icon Component ──────────────────────────────────────────────────────

function ServerIcon({ guild, isActive, onSelect }: ServerIconProps) {
  const iconUrl = guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
    : null;

  const content = (
    <div
      className={cn(
        "group relative flex h-12 w-12 items-center justify-center rounded-[24px] transition-all duration-200",
        "hover:rounded-[16px]",
        isActive && "rounded-[16px] bg-server text-white",
        !isActive && !guild.hasBot && "opacity-50 grayscale",
        !isActive && guild.hasBot && "bg-[#313338] text-[#DBDEE1] hover:bg-[#5865F2]"
      )}
    >
      {/* Active indicator pill */}
      <span
        className={cn(
          "absolute -left-[4px] w-[4px] rounded-r-full bg-white transition-all duration-200",
          isActive ? "h-10" : "h-0 group-hover:h-5"
        )}
      />

      {/* Icon or Initials */}
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={guild.name}
          className="h-full w-full rounded-[inherit] object-cover"
        />
      ) : (
        <span className="text-sm font-bold">
          {guild.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );

  if (!guild.hasBot) {
    const BOT_INSTALL_URL = process.env.NEXT_PUBLIC_BOT_INSTALL_URL ?? "";
    const installUrl = BOT_INSTALL_URL ? `${BOT_INSTALL_URL}&guild_id=${guild.id}` : "#";

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={installUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {content}
          </a>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="font-semibold">{guild.name}</p>
          <p className="text-xs text-muted-foreground">Add Bot to Server</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={() => onSelect(guild)} className="block">
          {content}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p className="font-semibold">{guild.name}</p>
        {guild.server && (
          <p className="text-xs text-muted-foreground capitalize">
            {guild.server.subscriptionTier}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Separator Component ──────────────────────────────────────────────────────

function ServerSeparator() {
  return (
    <div className="flex items-center justify-center py-2">
      <div className="h-[2px] w-8 rounded-full bg-[#35363C]" />
    </div>
  );
}

// ─── Home Button ──────────────────────────────────────────────────────────────

function HomeButton() {
  const pathname = usePathname();
  const isActive = pathname === "/dashboard" || pathname === "/";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/dashboard"
          className={cn(
            "group relative flex h-12 w-12 items-center justify-center rounded-[24px] transition-all duration-200",
            "hover:rounded-[16px]",
            isActive
              ? "rounded-[16px] bg-[#5865F2] text-white"
              : "bg-[#313338] text-[#DBDEE1] hover:bg-[#5865F2]"
          )}
        >
          <span
            className={cn(
              "absolute -left-[4px] w-[4px] rounded-r-full bg-white transition-all duration-200",
              isActive ? "h-10" : "h-0 group-hover:h-5"
            )}
          />
          <Home className="h-5 w-5" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">Dashboard</TooltipContent>
    </Tooltip>
  );
}

// ─── Documentation Button ──────────────────────────────────────────────────────

function DocumentationButton() {
  const pathname = usePathname();
  const isActive = pathname === "/documentation";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/documentation"
          className={cn(
            "group relative flex h-12 w-12 items-center justify-center rounded-[24px] transition-all duration-200",
            "hover:rounded-[16px]",
            isActive
              ? "rounded-[16px] bg-[#5865F2] text-white"
              : "bg-[#313338] text-[#DBDEE1] hover:bg-[#5865F2]"
          )}
        >
          <span
            className={cn(
              "absolute -left-[4px] w-[4px] rounded-r-full bg-white transition-all duration-200",
              isActive ? "h-10" : "h-0 group-hover:h-5"
            )}
          />
          <BookOpen className="h-5 w-5" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">Documentation</TooltipContent>
    </Tooltip>
  );
}

// ─── Add Server Button ────────────────────────────────────────────────────────

function AddServerButton() {
  const BOT_INSTALL_URL = process.env.NEXT_PUBLIC_BOT_INSTALL_URL ?? "";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={BOT_INSTALL_URL || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group relative flex h-12 w-12 items-center justify-center rounded-[24px] transition-all duration-200",
            "bg-[#313338] text-[#23A559] hover:rounded-[16px] hover:bg-[#23A559] hover:text-white"
          )}
        >
          <Plus className="h-5 w-5" />
        </a>
      </TooltipTrigger>
      <TooltipContent side="right">Add a Server</TooltipContent>
    </Tooltip>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────────

function ServerListSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 p-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="my-1 h-[2px] w-8 rounded-full bg-[#35363C]" />
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-12 rounded-full" />
      ))}
    </div>
  );
}

// ─── Server List Content (receives data, no hooks) ─────────────────────────────────

interface ServerListContentProps {
  guilds: GuildWithServerStatus[] | undefined;
  isLoading: boolean;
  activeServerId: string | null;
  onSelect: (guild: GuildWithServerStatus) => void;
}

export function ServerListContent({ guilds, isLoading, activeServerId, onSelect }: ServerListContentProps) {
  const guildsWithBot = guilds?.filter((g) => g.hasBot) ?? [];
  const guildsWithoutBot = guilds?.filter((g) => !g.hasBot) ?? [];

  return (
    <TooltipProvider delayDuration={0}>
      <ScrollArea className="flex-1">
        <div className="flex flex-col items-center gap-2 px-3">
          <HomeButton />
          <DocumentationButton />
          <ServerSeparator />

          {isLoading && <ServerListSkeleton />}

          {!isLoading && guilds && (
            <>
              {/* Servers with bot (active) */}
              {guildsWithBot.map((guild) => (
                <ServerIcon
                  key={guild.id}
                  guild={guild}
                  isActive={activeServerId === guild.server?.id}
                  onSelect={onSelect}
                />
              ))}

              {/* Separator between active and inactive */}
              {guildsWithBot.length > 0 && guildsWithoutBot.length > 0 && (
                <ServerSeparator />
              )}

              {/* Servers without bot (greyed out) */}
              {guildsWithoutBot.map((guild) => (
                <ServerIcon
                  key={guild.id}
                  guild={guild}
                  isActive={false}
                  onSelect={() => {}}
                />
              ))}

              {/* Add Server Button */}
              <ServerSeparator />
              <AddServerButton />
            </>
          )}
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}

// ─── Desktop Sidebar ────────────────────────────────────────────────────────────

export function ServerListDesktop(props: Omit<ServerListContentProps, "activeServerId"> & { activeServerId: string | null }) {
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[72px] flex-col bg-[#1E1F22] py-3 md:flex">
      <ServerListContent {...props} />
    </aside>
  );
}

// ─── Mobile Sidebar ──────────────────────────────────────────────────────────────

interface ServerListMobileProps extends ServerListContentProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ServerListMobile({ isOpen, onClose, ...props }: ServerListMobileProps) {
  return (
    <div className="w-[72px] bg-[#1E1F22] md:hidden">
      <ServerListContent {...props} />
    </div>
  );
}