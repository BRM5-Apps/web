"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { useServers } from "@/hooks/use-server";
import { useServerStore } from "@/stores/server-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ServerSwitcher() {
  const router = useRouter();
  const { data: servers, isLoading } = useServers();
  const { activeServerId, setActiveServer } = useServerStore();
  const [search, setSearch] = useState("");

  // Normalize servers in case cached data still uses the older
  // { items: [{ server, rankId }] } shape from the API client.
  const serverList =
    Array.isArray(servers)
      ? servers
      : (servers as any)?.items?.map((item: any) => item.server) ?? [];

  const filteredServers = serverList.filter((f: any) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeServer = serverList.find((f: any) => f.id === activeServerId);

  function handleSelect(serverId: string) {
    const server = servers?.find((f) => f.id === serverId);
    setActiveServer(serverId, server);
    router.push(`/server/${serverId}`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal bg-[#2B2D31] text-[#F1F1F2] border-[#3F4147] hover:bg-[#35373C] hover:text-[#F1F1F2]"
          disabled={isLoading}
        >
          <span className="truncate">
            {activeServer?.name ?? "Select server"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--sidebar-width)] p-0 bg-[#2B2D31] border-[#3F4147]" align="start">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#949BA4]" />
            <Input
              placeholder="Search servers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 bg-[#1E1F22] border-[#3F4147] text-[#F1F1F2] placeholder:text-[#949BA4]"
            />
          </div>
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-[300px]">
          {filteredServers.length === 0 ? (
            <div className="py-6 text-center text-sm text-[#949BA4]">
              No servers found
            </div>
          ) : (
            filteredServers.map((server: any) => (
              <DropdownMenuItem
                key={server.id}
                onClick={() => handleSelect(server.id)}
                className="flex items-center gap-3 px-3 py-2 text-[#DBDEE1] hover:bg-[#35373C] focus:bg-[#35373C] cursor-pointer"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#404249]">
                  {server.iconUrl ? (
                    <img
                      src={server.iconUrl}
                      alt={server.name}
                      className="h-6 w-6 rounded"
                    />
                  ) : (
                    <span className="text-xs font-bold text-[#5865F2]">
                      {server.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium truncate text-[#F1F1F2]">{server.name}</p>
                  <p className="text-xs text-[#949BA4] capitalize">
                    {server.subscriptionTier}
                  </p>
                </div>
                {server.id === activeServerId && (
                  <Check className="h-4 w-4 text-[#5865F2]" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/server")}
          className="gap-2 px-3 py-2 text-[#DBDEE1] hover:bg-[#35373C] focus:bg-[#35373C] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Browse Servers
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
