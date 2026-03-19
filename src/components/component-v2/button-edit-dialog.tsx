import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { DiscordModal, DiscordField, DiscordInput, DiscordButton } from "@/components/shared/discord-modal";
import { cn } from "@/lib/utils";
import { ActionEditorWorkbench } from "./action-editor-workbench";
import type { ButtonStyle, C2Button } from "./types";

const BUTTON_STYLES: {
  value: ButtonStyle;
  label: string;
  bg: string;
  text: string;
}[] = [
  { value: "blurple", label: "Primary", bg: "bg-[#5865F2]", text: "text-white" },
  { value: "grey", label: "Secondary", bg: "bg-[#4E5058]", text: "text-white" },
  { value: "green", label: "Success", bg: "bg-[#248046]", text: "text-white" },
  { value: "red", label: "Danger", bg: "bg-[#DA373C]", text: "text-white" },
];

interface ButtonEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  button: C2Button;
  onChange: (button: C2Button) => void;
  serverId?: string;
}

export function ButtonEditDialog({
  open,
  onOpenChange,
  button,
  onChange,
  serverId,
}: ButtonEditDialogProps) {
  const [draft, setDraft] = useState(button);
  const [flowEditorOpen, setFlowEditorOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(button);
    }
  }, [open, button]);

  return (
    <>
      <DiscordModal
        open={open}
        onOpenChange={onOpenChange}
        title="Edit Button Component"
        size="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <DiscordButton variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </DiscordButton>
            <DiscordButton
              onClick={() => {
                onChange(draft);
                onOpenChange(false);
              }}
            >
              Save changes
            </DiscordButton>
          </div>
        }
      >
        <div className="space-y-6 py-2">
          <DiscordField label="Button Label" required>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] bg-[#1E1F22] text-xl transition-colors hover:bg-[#2B2D31]"
                title="Set emoji"
              >
                {draft.emoji ?? "😀"}
              </button>
              <div className="relative flex-1">
                <DiscordInput
                  value={draft.label}
                  maxLength={80}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                  placeholder="Click me!"
                  className="h-10 pr-14"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#80848E]">
                  {draft.label.length}/80
                </span>
              </div>
            </div>
          </DiscordField>

          <DiscordField label="Style">
            <div className="flex gap-1 overflow-hidden rounded-[3px] bg-[#1E1F22] p-1">
              {BUTTON_STYLES.map(({ value, label, bg, text }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDraft({ ...draft, style: value })}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-[3px] py-2 text-sm font-semibold transition-all",
                    draft.style === value
                      ? `${bg} ${text} shadow-md`
                      : "text-[#B5BAC1] hover:bg-[#2B2D31] hover:text-[#DBDEE1]"
                  )}
                >
                  {draft.style === value && <Check className="h-3.5 w-3.5" />}
                  {label}
                </button>
              ))}
            </div>
          </DiscordField>

          <DiscordField label="State">
            <label className="group flex cursor-pointer items-center gap-3">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={draft.disabled}
                  onChange={(e) => setDraft({ ...draft, disabled: e.target.checked })}
                  className="peer h-6 w-6 appearance-none rounded-[4px] border-2 border-[#80848E] bg-transparent transition-all checked:border-[#5865F2] checked:bg-[#5865F2]"
                />
                <Check className="pointer-events-none absolute h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
              </div>
              <span className="text-[15px] font-medium text-[#DBDEE1] transition-colors group-hover:text-white">
                Disable button
              </span>
            </label>
            <p className="ml-9 mt-1.5 text-sm text-[#B5BAC1]">
              Users will not be able to click this button.
            </p>
          </DiscordField>

          <DiscordField label="Action Flow">
            <p className="mb-3 text-sm text-[#B5BAC1]">
              Configure what happens when a user clicks this button.
            </p>
            <DiscordButton
              type="button"
              variant="secondary"
              className="w-full text-[15px]"
              onClick={() => setFlowEditorOpen(true)}
            >
              Open Action Workbench{" "}
              {(draft.actionGraph?.nodes.length ?? draft.flow.length) > 0 && (
                <span className="ml-1 text-[#B5BAC1]">
                  ({draft.actionGraph?.nodes.length ?? draft.flow.length} items)
                </span>
              )}
            </DiscordButton>
          </DiscordField>
        </div>
      </DiscordModal>

      <ActionEditorWorkbench
        open={flowEditorOpen}
        onOpenChange={setFlowEditorOpen}
        title="Button Action Editor"
        actions={draft.flow}
        graph={draft.actionGraph}
        onSave={({ graph, flow }) => setDraft({ ...draft, actionGraph: graph, flow })}
        serverId={serverId}
      />
    </>
  );
}
