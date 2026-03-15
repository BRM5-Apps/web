"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { EmbedBuilder, type EmbedFormData } from "@/components/templates/embed-builder";
import { useCreateEmbedTemplate } from "@/hooks/use-templates";
import { Button } from "@/components/ui/button";
import { LayoutTemplate } from "lucide-react";

export default function MessageBuilderPage() {
  const params = useParams<{ factionId: string }>();
  const factionId = params.factionId;
  const router = useRouter();

  const [saved, setSaved] = useState(false);
  const createMutation = useCreateEmbedTemplate(factionId);

  function handleSave(form: EmbedFormData) {
    createMutation.mutate(
      {
        name: form.name,
        title: form.title || undefined,
        description: form.description || undefined,
        color: form.color || undefined,
        fields: form.fields?.length ? form.fields : undefined,
        footer: form.footerText || undefined,
        imageUrl: form.imageUrl || undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
        authorName: form.authorName || undefined,
        authorIconUrl: form.authorIconUrl || undefined,
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => router.push(`/faction/${factionId}/templates/embeds`), 1200);
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Message Builder</h1>
          <p className="text-muted-foreground">
            Compose a Discord embed message and save it as a template.
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
        <EmbedBuilder
          onSave={handleSave}
          isSaving={createMutation.isPending}
        />
      )}
    </div>
  );
}
