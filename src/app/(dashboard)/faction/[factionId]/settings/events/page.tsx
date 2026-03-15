"use client";

import { useParams } from "next/navigation";
import { CalendarCog } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EventSettingsPage() {
  useParams<{ factionId: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Settings</h1>
        <p className="text-muted-foreground">Configure event types, defaults, and scheduling rules.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCog className="h-5 w-5 text-blue-500" />
            Event Configuration
          </CardTitle>
          <CardDescription>Default event types, required attendance, and scheduling rules.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Event settings coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
