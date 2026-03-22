"use client";

import { useParams } from "next/navigation";
import { Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ServerSettingsPage() {
  useParams<{ serverId: string }>();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Server Settings</h1>
        <p className="text-muted-foreground">Configure general server settings and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            General Settings
          </CardTitle>
          <CardDescription>Server name, icon, description, and other core settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">General settings coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
