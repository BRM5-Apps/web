"use client";

import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeDirection?: "up" | "down";
  icon?: LucideIcon;
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  changeDirection,
  icon: Icon,
  isLoading,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <Skeleton className="mt-3 h-8 w-20" />
          <Skeleton className="mt-2 h-4 w-16" />
        </CardContent>
      </Card>
    );
  }

  const direction = changeDirection ?? (change !== undefined ? (change >= 0 ? "up" : "down") : undefined);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {change !== undefined && direction && (
          <div className="mt-2 flex items-center gap-1">
            {direction === "up" ? (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                direction === "up" ? "text-emerald-500" : "text-red-500"
              )}
            >
              {Math.abs(change)}%
            </span>
            <span className="text-xs text-muted-foreground">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
