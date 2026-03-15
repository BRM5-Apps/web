"use client";

import { useParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnitsPage() {
  useParams<{ factionId: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Units</h1>
        <p className="text-muted-foreground">Manage your faction's unit structure.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-violet-500" />
            Units Management
          </CardTitle>
          <CardDescription>Organize members into units and sub-units.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Units management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
