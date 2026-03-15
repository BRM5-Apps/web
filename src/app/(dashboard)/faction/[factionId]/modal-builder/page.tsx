"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ContainerBuilder } from "@/components/templates/container-builder";
import { useCreateContainerTemplate } from "@/hooks/use-templates";
import { Button } from "@/components/ui/button";
import { LayoutTemplate } from "lucide-react";

export default function ModalBuilderPage() {
  const params = useParams<{ factionId: string }>();
  const factionId = params.factionId;
  const router = useRouter();

  const [saved, setSaved] = useState(false);
  const createMutation = useCreateContainerTemplate(factionId);

  function handleSave(payload: { name: string; accentColor?: string; components: unknown[] }) {
    createMutation.mutate(
      { name: payload.name, accentColor: payload.accentColor, components: payload.components },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => router.push(`/faction/${factionId}/templates/containers`), 1200);
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modal Builder</h1>
          <p className="text-muted-foreground">
            Build interactive message components with buttons and action rows.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/faction/${factionId}/templates`}>
            <LayoutTemplate className="mr-2 h-4 w-4" />
            My Templates
          </Link>
        </Button>
      </div>

      {saved ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Saved! Redirecting to templates…
        </div>
      ) : (
        <ContainerBuilder
          onSave={handleSave}
          isSaving={createMutation.isPending}
        />
      )}
    </div>
  );
}
