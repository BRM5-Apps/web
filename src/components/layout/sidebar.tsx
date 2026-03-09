"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { navConfig } from "@/config/nav";
import { NavItem } from "./nav-item";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[var(--sidebar-width)] flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-[var(--header-height)] items-center gap-2 border-b px-4">
        <Image src="/images/logo.svg" alt="FactionHub" width={28} height={28} />
        <span className="font-semibold text-sidebar-foreground">FactionHub</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navConfig.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            {section.items.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname.startsWith(item.href)}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* User menu */}
      <div className="border-t p-3">
        <UserMenu />
      </div>
    </aside>
  );
}
