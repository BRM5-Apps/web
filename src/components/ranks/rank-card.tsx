"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronUp, ChevronDown, Pencil, Trash2, Star, Users, Shield } from "lucide-react";
import type { RankWithDetails } from "@/types/rank";

interface RankCardProps {
  rank: RankWithDetails;
  isFirst: boolean;
  isLast: boolean;
  canManage: boolean;
  onEdit: (rank: RankWithDetails) => void;
  onDelete: (rank: RankWithDetails) => void;
  onMoveUp: (rank: RankWithDetails) => void;
  onMoveDown: (rank: RankWithDetails) => void;
}

export function RankCard({
  rank,
  isFirst,
  isLast,
  canManage,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: RankCardProps) {
  return (
    <Card
      className="border-l-4 transition-colors hover:bg-accent/30"
      style={{ borderLeftColor: rank.color || "#6b7280" }}
    >
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4 pb-2">
        {/* Icon or color swatch */}
        {rank.iconUrl ? (
          <img
            src={rank.iconUrl}
            alt={rank.name}
            className="h-8 w-8 rounded object-cover"
          />
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded"
            style={{ backgroundColor: `${rank.color || "#6b7280"}20` }}
          >
            <Shield
              className="h-4 w-4"
              style={{ color: rank.color || "#6b7280" }}
            />
          </div>
        )}

        {/* Name + default indicator */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{rank.name}</span>
            {rank.isDefault && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                </TooltipTrigger>
                <TooltipContent>Default rank</TooltipContent>
              </Tooltip>
            )}
          </div>
          <span className="text-xs text-muted-foreground">Level {rank.level}</span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {rank.memberCount}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            {rank.permissionCount}
          </Badge>
        </div>

        {/* Actions */}
        {canManage && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={isFirst}
                  onClick={() => onMoveUp(rank)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move up</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={isLast}
                  onClick={() => onMoveDown(rank)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move down</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(rank)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(rank)}
                  disabled={rank.isDefault}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {rank.isDefault ? "Cannot delete default rank" : "Delete"}
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}
