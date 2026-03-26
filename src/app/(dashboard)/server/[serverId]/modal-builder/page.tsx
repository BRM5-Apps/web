"use client";

import { useParams } from "next/navigation";
import { DiscordModalBuilder } from "@/components/modal-builder/discord-modal-builder";
import { useCreateModalTemplate } from "@/hooks/use-templates";

export default function ModalBuilderPage() {
  const { serverId } = useParams<{ serverId: string }>();
  const createModal = useCreateModalTemplate(serverId);

  return (
    <div className="-mx-6 -my-6 min-h-screen p-8" style={{ background: "linear-gradient(135deg, #2F2F34 0%, #232327 60%, #342E26 100%)" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F1F2]">Modal Builder</h1>
        <p className="mt-1 text-sm text-[#8F8E8E]">
          Build Discord modals with a live preview. Hover over components to edit them.
        </p>
      </div>
      <DiscordModalBuilder
        guildId={serverId}
        onSave={(pages, settings) => {
          const name = pages[0]?.title?.trim() || `Modal ${new Date().toLocaleTimeString()}`;
          createModal.mutate({ name, template_data: { pages, settings } });
        }}
        isSaving={createModal.isPending}
      />
    </div>
  );
}
