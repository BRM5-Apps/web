"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePositionHolders, useAssignPosition, useUnassignPosition } from "@/hooks/use-positions";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { MoreHorizontal, Users, Edit, Trash2, UserPlus } from "lucide-react";
import type { PositionWithHolders } from "@/types/position";
import type { ServerMember } from "@/types/server";

interface PositionCardProps {
  position: PositionWithHolders;
  serverId: string;
  canManage: boolean;
  onEdit: (position: PositionWithHolders) => void;
  onDelete: (position: PositionWithHolders) => void;
}

export function PositionCard({
  position,
  serverId,
  canManage,
  onEdit,
  onDelete,
}: PositionCardProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const { data: holders } = usePositionHolders(serverId, position.id);

  // Fetch members for the assign dialog
  const { data: membersData } = useQuery({
    queryKey: queryKeys.members.list(serverId, {}),
    queryFn: ({ signal }) => api.members.list(serverId, {}, { signal }),
    enabled: !!serverId && assignDialogOpen,
  });

  const assignMutation = useAssignPosition(serverId);
  const unassignMutation = useUnassignPosition(serverId);

  const activeHolders = holders?.filter((h) => !h.endedAt) ?? [];
  const members = membersData?.members ?? [];

  function handleAssignMember(memberId: string) {
    assignMutation.mutate(
      {
        positionId: position.id,
        payload: { serverUserId: memberId },
      },
      {
        onSuccess: () => {
          setAssignDialogOpen(false);
        },
      }
    );
  }

  function handleUnassignMember(assignmentId: string) {
    unassignMutation.mutate(assignmentId);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{position.name}</CardTitle>
            {position.unit && (
              <Badge variant="secondary" className="text-xs">
                {position.unit.name}
              </Badge>
            )}
            {position.rank && (
              <Badge variant="outline" className="text-xs">
                {position.rank.name}
              </Badge>
            )}
          </div>
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(position)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(position)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        <CardContent>
          {position.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {position.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{activeHolders.length} member(s)</span>
            </div>
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAssignDialogOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Assign
              </Button>
            )}
          </div>

          {activeHolders.length > 0 && (
            <div className="mt-4 space-y-2">
              {activeHolders.map((holder) => (
                <div
                  key={holder.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="text-sm">
                    {/* Display serverUserId for now - API could be enhanced to return user details */}
                    Member ID: {holder.serverUserId.slice(0, 8)}...
                  </div>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnassignMember(holder.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Member Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Position</DialogTitle>
            <DialogDescription>
              Select a member to assign to {position.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {members.map((member: ServerMember) => (
              <Button
                key={member.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleAssignMember(member.id)}
                disabled={assignMutation.isPending}
              >
                {member.username}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}