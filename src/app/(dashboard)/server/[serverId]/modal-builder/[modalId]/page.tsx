"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { DiscordModalBuilder, type ModalPage, type ModalSettings, type ModalComponent } from "@/components/modal-builder/discord-modal-builder";
import { ModalSettingsPanel } from "@/components/modal-builder/modal-settings-panel";
import { useModalTemplate, useCreateModalTemplate, useUpdateModalTemplate } from "@/hooks/use-templates";
import { useSyncModalElements, buildSyncRequest } from "@/hooks/use-modal-elements";
import type { ActionGraphDocument } from "@/components/component-v2/types";

interface ModalSettingsData {
  roleRestrictions: { requiredRoles: string[]; restrictedRoles: string[] };
  outputChannel: string;
  mentions: string[];
  roleOutput: { addRoles: string[]; removeRoles: string[] };
}

export default function ModalBuilderPage() {
  const { serverId, modalId } = useParams<{ serverId: string; modalId?: string }>();
  const router = useRouter();
  const isNew = !modalId || modalId === "new";

  const { data: template, isLoading } = useModalTemplate(serverId, isNew ? "" : modalId);
  const createModal = useCreateModalTemplate(serverId);
  const updateModal = useUpdateModalTemplate(serverId, isNew ? "" : modalId);
  const syncModalElements = useSyncModalElements(serverId);

  const [modalSettings, setModalSettings] = useState<ModalSettingsData>({
    roleRestrictions: { requiredRoles: [], restrictedRoles: [] },
    outputChannel: "",
    mentions: [],
    roleOutput: { addRoles: [], removeRoles: [] },
  });

  // Track current pages for workbench integration
  const [currentPages, setCurrentPages] = useState<ModalPage[]>([]);
  const [actionGraph, setActionGraph] = useState<ActionGraphDocument | undefined>();

  // Track if we've synced modal elements for this modal (to avoid duplicate syncs)
  const hasSyncedElements = useRef<string | null>(null);

  // Extract fields from all pages for workbench
  const allFields: ModalComponent[] = currentPages.flatMap((page) => page.components);

  // Extract pages from template
  const initialPages = useMemo<ModalPage[] | undefined>(() => {
    if (!template) return undefined;
    const templatePages = template.template_data?.pages as ModalPage[] | undefined;
    return templatePages && templatePages.length > 0 ? templatePages : undefined;
  }, [template]);

  // Extract settings from template
  const initialModalSettings = useMemo(() => {
    if (!template) return undefined;
    // settings is now a top-level field on ModalTemplate
    const templateSettings = (template as any).settings ?? {};
    return {
      roleRestrictions: templateSettings.roleRestrictions ?? { requiredRoles: [], restrictedRoles: [] },
      outputChannel: templateSettings.outputChannel ?? "",
      mentions: templateSettings.mentions ?? [],
      roleOutput: templateSettings.roleOutput ?? { addRoles: [], removeRoles: [] },
    };
  }, [template]);

  // Sync local settings state when template loads
  useEffect(() => {
    if (initialModalSettings) {
      setModalSettings(initialModalSettings);
    }
  }, [initialModalSettings]);

  // Load action graph from template
  useEffect(() => {
    if (template) {
      // action_graph is now a top-level field on ModalTemplate
      const templateActionGraph = (template as any).action_graph;
      if (templateActionGraph) {
        setActionGraph(templateActionGraph);
      }
    }
  }, [template]);

  // Sync elements when loading an existing modal (one-time per modal)
  useEffect(() => {
    if (!isNew && template && modalId && hasSyncedElements.current !== modalId) {
      // pages is inside template_data
      const templatePages = template.template_data?.pages as ModalPage[] | undefined;
      if (templatePages && templatePages.length > 0) {
        const modalTitle = templatePages[0]?.title ?? "Untitled";
        const allFields = templatePages.flatMap((page) => page.components);
        const inputFieldTypes = ["short-answer", "paragraph", "dropdown", "multiple-choice", "checkboxes", "channel-select", "user-role-select"];

        const fieldsToSync = allFields
          .filter((c) => inputFieldTypes.includes(c.type))
          .map((c) => ({
            field_id: c.id,
            field_type: c.type,
            field_label: c.label || c.placeholder || c.id,
            is_required: c.required ?? false,
          }));

        console.log("[Modal Elements] Initial load sync:", fieldsToSync.length, "fields for modal:", modalId);

        syncModalElements.mutateAsync({
          modal_template_id: modalId,
          modal_name: modalTitle,
          fields: fieldsToSync,
        }).then(() => {
          hasSyncedElements.current = modalId;
          console.log("[Modal Elements] Initial load sync complete");
        }).catch((err) => {
          console.warn("[Modal Elements] Failed to sync on load:", err);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, isNew, modalId]);

  const handleSave = useCallback(async (pages: ModalPage[], settings: ModalSettings) => {
    const modalTitle = pages[0]?.title ?? "Untitled";
    const allFields = pages.flatMap((page) => page.components);
    const payload = {
      name: modalTitle,
      template_data: { pages },
      settings: modalSettings as unknown as Record<string, unknown>,
      action_graph: actionGraph as unknown as Record<string, unknown> | undefined,
    };

    try {
      let savedId = modalId;
      if (isNew) {
        const created = await createModal.mutateAsync(payload);
        savedId = created.id;
        router.push(`/server/${serverId}/modal-builder/${created.id}`);
      } else {
        await updateModal.mutateAsync(payload);
      }

      // Sync modal field elements to the element catalog
      if (savedId) {
        const inputFieldTypes = ["short-answer", "paragraph", "dropdown", "multiple-choice", "checkboxes", "channel-select", "user-role-select"];
        const fieldsToSync = allFields
          .filter((c) => inputFieldTypes.includes(c.type))
          .map((c) => ({
            field_id: c.id,
            field_type: c.type,
            field_label: c.label || c.placeholder || c.id,
            is_required: c.required ?? false,
          }));

        console.log("[Modal Elements] Syncing fields:", fieldsToSync.length, "fields for modal:", savedId);

        try {
          await syncModalElements.mutateAsync({
            modal_template_id: savedId,
            modal_name: modalTitle,
            fields: fieldsToSync,
          });
          console.log("[Modal Elements] Sync complete");
        } catch (syncErr) {
          console.error("[Modal Elements] Failed to sync:", syncErr);
        }
      }
    } catch (err) {
      console.error("Failed to save modal:", err);
    }
  }, [isNew, createModal, updateModal, router, serverId, modalId, modalSettings, actionGraph, syncModalElements]);

  const isSaving = createModal.isPending || updateModal.isPending;

  if (!isNew && isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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
        <h1 className="text-xl font-semibold text-[#f1f1f2]">
          {isNew ? "New Modal" : template?.name ?? "Edit Modal"}
        </h1>
      </div>

      {/* Builder */}
      <div className="space-y-8">
        <DiscordModalBuilder
          guildId={serverId}
          onSave={handleSave}
          onPagesChange={setCurrentPages}
          isSaving={isSaving}
          initialPages={initialPages}
        />

        {/* Settings */}
        <ModalSettingsPanel
          serverId={serverId}
          settings={modalSettings}
          onChange={setModalSettings}
          modalId={isNew ? undefined : modalId}
          modalName={currentPages[0]?.title || template?.name || "Untitled"}
          fields={allFields}
          actionGraph={actionGraph}
          onActionGraphChange={setActionGraph}
        />
      </div>
    </>
  );
}