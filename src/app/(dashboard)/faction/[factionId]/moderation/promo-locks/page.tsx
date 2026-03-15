"use client";

import { useParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PromoLocksPage() {
  useParams<{ factionId: string }>();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Promo Locks</h1>
        <p className="text-muted-foreground">Manage promotion locks for faction members.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            Promotion Locks
          </CardTitle>
          <CardDescription>Members currently locked from promotion.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Promotion lock management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
