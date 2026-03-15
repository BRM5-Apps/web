"use client";

import { useParams } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatsPage() {
  useParams<{ factionId: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Stats</h1>
        <p className="text-muted-foreground">View faction analytics, trends, and performance metrics.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Faction Overview
          </CardTitle>
          <CardDescription>Member activity, event participation, and growth trends.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Analytics dashboard coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
