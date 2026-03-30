"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemberPositions } from "@/hooks/use-positions";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { ServerMember } from "@/types/server";

interface MemberProfileDialogProps {
  serverId: string;
  member: ServerMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberProfileDialog({
  serverId,
  member,
  open,
  onOpenChange,
}: MemberProfileDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: positions, isLoading: positionsLoading } = useMemberPositions(
    serverId,
    member?.id ?? "",
    { enabled: !!member && activeTab === "positions" }
  );

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {member.avatarUrl && (
                <AvatarImage src={member.avatarUrl} alt={member.username} />
              )}
              <AvatarFallback className="text-xl">
                {member.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{member.username}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                {member.rankName && (
                  <Badge
                    variant="outline"
                    style={
                      member.rankColor
                        ? { borderColor: member.rankColor, color: member.rankColor }
                        : undefined
                    }
                  >
                    {member.rankName}
                  </Badge>
                )}
                {member.unitName && (
                  <Badge variant="secondary">{member.unitName}</Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rank-history">Rank</TabsTrigger>
            <TabsTrigger value="unit-history">Unit</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="permissions">Perms</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Points</div>
                <div className="text-2xl font-bold">{member.points.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Joined</div>
                <div className="text-lg font-medium">{formatDate(member.joinedAt)}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Last Active</div>
                <div className="text-lg font-medium">
                  {member.lastActiveAt
                    ? formatRelativeTime(member.lastActiveAt)
                    : "—"}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Status</div>
                <Badge variant={member.isActive ? "default" : "secondary"}>
                  {member.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rank-history" className="mt-4">
            <div className="text-center text-muted-foreground py-8">
              <p>Rank history will be displayed here.</p>
              <p className="text-sm mt-2">Feature coming soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="unit-history" className="mt-4">
            <div className="text-center text-muted-foreground py-8">
              <p>Unit history will be displayed here.</p>
              <p className="text-sm mt-2">Feature coming soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="positions" className="mt-4">
            {positionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : positions && positions.length > 0 ? (
              <div className="space-y-3">
                {positions.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {assignment.position?.name ?? "Position"}
                      </span>
                      {assignment.unit && (
                        <Badge variant="secondary" className="w-fit mt-1">
                          {assignment.unit.name}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Since {formatDate(assignment.assignedAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No positions assigned.
              </div>
            )}
          </TabsContent>

          <TabsContent value="permissions" className="mt-4">
            <div className="text-center text-muted-foreground py-8">
              <p>Combined permissions from rank and positions will be displayed here.</p>
              <p className="text-sm mt-2">Feature coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}