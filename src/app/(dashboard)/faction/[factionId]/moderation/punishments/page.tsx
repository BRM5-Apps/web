"use client";

import { useParams } from "next/navigation";
import { Gavel } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PunishmentsPage() {
  useParams<{ factionId: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Punishments</h1>
        <p className="text-muted-foreground">Manage faction punishments and disciplinary actions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-red-500" />
            Punishment Log
          </CardTitle>
          <CardDescription>Active and historical punishments for faction members.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Punishment management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
