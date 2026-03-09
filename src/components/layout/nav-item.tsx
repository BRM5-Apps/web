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
      className={cn("nav-link", active && "nav-link-active")}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
