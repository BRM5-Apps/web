"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useAdminGuildsWithServers, type GuildWithServerStatus } from "@/hooks/use-admin-guilds";
import { useServerStore } from "@/stores/server-store";
import { ServerListContent } from "./server-list";
import { ChannelList } from "./channel-list";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Discord-style sidebar with:
 * - Far left: Server list (guild icons)
 * - Right side: Channel list (navigation categories)
 *
 * Data is fetched ONCE here and passed to both desktop/mobile views
 * to prevent duplicate API calls.
 */
export function Sidebar() {
  const router = useRouter();
  const { data: guilds, isLoading } = useAdminGuildsWithServers();
  const { activeServerId, setActiveServer } = useServerStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (guild: GuildWithServerStatus) => {
    if (!guild.server) return;
    setActiveServer(guild.server.id, guild.server);
    router.push(`/server/${guild.server.id}`);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop sidebar - visible on md+ */}
      {/* Server icons (72px) */}
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[72px] flex-col bg-[#1E1F22] py-3 md:flex">
        <ServerListContent
          guilds={guilds}
          isLoading={isLoading}
          activeServerId={activeServerId}
          onSelect={handleSelect}
        />
      </aside>
      {/* Channel list (240px) - shown on desktop when a server is selected */}
      {activeServerId && (
        <ChannelList />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className={cn(
          "fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full",
          "bg-[#1E1F22] text-white shadow-lg md:hidden"
        )}
        aria-label="Open navigation"
      />

      {/* Mobile sheet - only rendered content when open */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[312px] p-0 bg-transparent border-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full">
            <div className="w-[72px] bg-[#1E1F22]">
              <ServerListContent
                guilds={guilds}
                isLoading={isLoading}
                activeServerId={activeServerId}
                onSelect={handleSelect}
              />
            </div>
            <div className="w-[240px] bg-[#2B2D31]">
              <ChannelList />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}