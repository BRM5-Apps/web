"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DiscordModalBuilder, type ModalPage, type ModalSettings, type ModalComponent } from "@/components/modal-builder/discord-modal-builder";
import { ModalSettingsPanel } from "@/components/modal-builder/modal-settings-panel";
import { useCreateModalTemplate } from "@/hooks/use-templates";
import type { ActionGraphDocument } from "@/components/component-v2/types";

interface ModalSettingsData {
  roleRestrictions: { requiredRoles: string[]; restrictedRoles: string[] };
  outputChannel: string;
  mentions: string[];
  roleOutput: { addRoles: string[]; removeRoles: string[] };
}

export default function NewModalBuilderPage() {
  const { serverId } = useParams<{ serverId: string }>();
  const router = useRouter();
  const createModal = useCreateModalTemplate(serverId);

  const [modalSettings, setModalSettings] = useState<ModalSettingsData>({
    roleRestrictions: { requiredRoles: [], restrictedRoles: [] },
    outputChannel: "",
    mentions: [],
    roleOutput: { addRoles: [], removeRoles: [] },
  });

  // Track current pages for workbench integration
  const [currentPages, setCurrentPages] = useState<ModalPage[]>([]);
  const [actionGraph, setActionGraph] = useState<ActionGraphDocument | undefined>();

  // Extract fields from all pages for workbench
  const allFields: ModalComponent[] = currentPages.flatMap((page) => page.components);

  const handleSave = useCallback(async (pages: ModalPage[], settings: ModalSettings) => {
    const modalTitle = pages[0]?.title ?? "Untitled";
    const payload = {
      name: modalTitle,
      template_data: { pages },
      settings: modalSettings as unknown as Record<string, unknown>,
      action_graph: actionGraph as unknown as Record<string, unknown> | undefined,
    };

    try {
      const created = await createModal.mutateAsync(payload);
      router.push(`/server/${serverId}/modal-builder/${created.id}`);
    } catch (err) {
      console.error("Failed to save modal:", err);
    }
  }, [createModal, router, serverId, modalSettings, actionGraph]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/server/${serverId}/modals`}
          className="flex items-center gap-1.5 text-sm text-[#b5bac1] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Modals
        </Link>
        <span className="text-[#3f4147]">/</span>
        <h1 className="text-xl font-semibold text-[#f1f1f2]">New Modal</h1>
      </div>

      {/* Builder */}
      <div className="space-y-8">
        <DiscordModalBuilder
          guildId={serverId}
          onSave={handleSave}
          onPagesChange={setCurrentPages}
          isSaving={createModal.isPending}
        />

        {/* Settings */}
        <ModalSettingsPanel
          serverId={serverId}
          settings={modalSettings}
          onChange={setModalSettings}
          modalName={currentPages[0]?.title || "Untitled"}
          fields={allFields}
          actionGraph={actionGraph}
          onActionGraphChange={setActionGraph}
        />
      </div>
    </>
  );
}
