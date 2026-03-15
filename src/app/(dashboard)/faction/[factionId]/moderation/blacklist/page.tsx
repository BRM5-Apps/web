"use client";

import { useParams } from "next/navigation";
import { Ban } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BlacklistPage() {
  useParams<{ factionId: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blacklist</h1>
        <p className="text-muted-foreground">Manage blacklisted users from your faction.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500" />
            Blacklisted Users
          </CardTitle>
          <CardDescription>Users banned from joining this faction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Blacklist management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
