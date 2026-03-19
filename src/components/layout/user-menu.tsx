"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User, CreditCard } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useServerStore } from "@/stores/server-store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const { user, isAuthenticated } = useAuth();
  const { activeServer } = useServerStore();

  if (!isAuthenticated || !user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.username} />
            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#2B2D31] border-[#3F4147]" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-[#F1F1F2]">{user.username}</p>
            {activeServer && (
              <p className="text-xs leading-none text-[#949BA4]">
                {activeServer.name}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#3F4147]" />
        <DropdownMenuItem asChild className="text-[#DBDEE1] hover:bg-[#35373C] focus:bg-[#35373C] cursor-pointer">
          <Link href="/dashboard/profile">
            <User className="mr-2 h-4 w-4" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-[#DBDEE1] hover:bg-[#35373C] focus:bg-[#35373C] cursor-pointer">
          <Link href="/dashboard/billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#3F4147]" />
        <DropdownMenuItem
          onClick={async () => {
            // Clear backend API token cookie, then end NextAuth session.
            await fetch("/api/auth/clear", { method: "POST" });
            await signOut({ callbackUrl: "/" });
          }}
          className="text-destructive focus:text-destructive hover:bg-[#35373C] focus:bg-[#35373C] cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
