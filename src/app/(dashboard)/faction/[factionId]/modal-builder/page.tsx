"use client";

import { DiscordModalBuilder } from "@/components/modal-builder/discord-modal-builder";

export default function ModalBuilderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modal Builder</h1>
        <p className="text-muted-foreground">
          Build Discord modals with a live preview. Hover over components to edit them.
        </p>
      </div>

      <DiscordModalBuilder />
    </div>
  );
}
