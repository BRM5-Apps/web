"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

export function NavItem({ href, icon: Icon, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-[4px] px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[#404249] text-[#F1F1F2] border-l-2 border-[#5865F2]"
          : "text-[#949BA4] hover:bg-[#35373C] hover:text-[#F1F1F2]"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
