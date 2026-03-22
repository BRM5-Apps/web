"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { ServerList } from "./server-list";
import { ChannelList } from "./channel-list";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Discord-style sidebar with:
 * - Far left: Server list (guild icons)
 * - Right side: Channel list (navigation categories)
 */
function DesktopSidebar() {
  return (
    <>
      <ServerList />
      <ChannelList />
    </>
  );
}

/**
 * Mobile sidebar with hamburger menu
 */
function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full",
          "bg-[#1E1F22] text-white shadow-lg md:hidden"
        )}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile sheet with both server and channel lists */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[312px] p-0 bg-transparent border-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full">
            <div className="w-[72px] bg-[#1E1F22]">
              <ServerList />
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

export function Sidebar() {
  return (
    <>
      <div className="hidden md:block">
        <DesktopSidebar />
      </div>
      <div className="md:hidden">
        <MobileSidebar />
      </div>
    </>
  );
}
