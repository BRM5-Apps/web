"use client";

import { useParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PermissionSettingsPage() {
  useParams<{ serverId: string }>();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permission Settings</h1>
        <p className="text-muted-foreground">Configure rank-based permission assignments for this server.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            Permission Matrix
          </CardTitle>
          <CardDescription>Assign which permissions each rank has access to.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Permission settings coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
