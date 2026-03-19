"use client";

import { useParams } from "next/navigation";
import { ListChecks } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BlacklistConfigPage() {
  useParams<{ serverId: string }>();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blacklist Config</h1>
        <p className="text-muted-foreground">Configure blacklist rules and auto-ban triggers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-red-500" />
            Blacklist Configuration
          </CardTitle>
          <CardDescription>Auto-ban triggers, appeal settings, and notification preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Blacklist configuration coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
