"use client";

import { useParams } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EventRequestsPage() {
  useParams<{ factionId: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Requests</h1>
        <p className="text-muted-foreground">Review and approve event requests from members.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-emerald-500" />
            Pending Requests
          </CardTitle>
          <CardDescription>Event requests awaiting approval.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Event requests coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
