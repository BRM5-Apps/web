"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowEditor } from "./flow-editor";
import type { C2Button, ButtonStyle } from "./types";

// ── BUTTON_STYLES ─────────────────────────────────────────────────────────────

const BUTTON_STYLES: {
  value: ButtonStyle;
  label: string;
  bg: string;
  text: string;
}[] = [
  { value: "blurple", label: "Blurple", bg: "bg-[#5865F2]", text: "text-white" },
  { value: "grey", label: "Grey", bg: "bg-[#4e5058]", text: "text-white" },
  { value: "green", label: "Green", bg: "bg-[#248046]", text: "text-white" },
  { value: "red", label: "Red", bg: "bg-[#da373c]", text: "text-white" },
];

// ── ButtonEditDialog ──────────────────────────────────────────────────────────

interface ButtonEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  button: C2Button;
  onChange: (button: C2Button) => void;
  factionId?: string;
}

export function ButtonEditDialog({
  open,
  onOpenChange,
  button,
  onChange,
  factionId,
}: ButtonEditDialogProps) {
  const [flowEditorOpen, setFlowEditorOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#2b2d31] border-[#3f4147] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Component</DialogTitle>
        </DialogHeader>

        {/* Emoji + Label row */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded bg-[#1e1f22] border border-[#3f4147] text-xl hover:bg-[#3f4147] flex-shrink-0"
            title="Set emoji"
          >
            {button.emoji ?? "😀"}
          </button>
          <div className="flex-1 relative">
            <Input
              value={button.label}
              maxLength={80}
              onChange={(e) => onChange({ ...button, label: e.target.value })}
              placeholder="Button label"
              className="bg-[#1e1f22] border-[#3f4147] text-white pr-14"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs italic text-gray-500 pointer-events-none">
              {button.label.length}/80
            </span>
          </div>
        </div>

        {/* Disabled checkbox */}
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={button.disabled}
            onChange={(e) => onChange({ ...button, disabled: e.target.checked })}
            className="accent-[#5865F2]"
          />
          Disabled
        </label>

        {/* Style selector */}
        <div>
          <Label className="text-xs text-gray-400 mb-1 block">Style</Label>
          <div className="flex rounded overflow-hidden border border-[#3f4147]">
            {BUTTON_STYLES.map(({ value, label, bg, text }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ ...button, style: value })}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors",
                  button.style === value
                    ? `${bg} ${text}`
                    : "bg-[#1e1f22] text-gray-400 hover:bg-[#2b2d31]"
                )}
              >
                {button.style === value && <Check className="h-3 w-3" />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Flow section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-300">Flow</Label>
            <a href="#" className="text-xs text-[#5865F2] hover:underline">
              what&apos;s a flow?
            </a>
          </div>
          <Button
            type="button"
            onClick={() => setFlowEditorOpen(true)}
            className="bg-[#5865F2] hover:bg-[#4752c4] text-white w-full"
          >
            Edit Flow{" "}
            {button.flow.length > 0 && `(${button.flow.length} actions)`}
          </Button>
        </div>

        {/* Save button */}
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-[#5865F2] hover:bg-[#4752c4] text-white px-8"
          >
            Save
          </Button>
        </div>

        {/* Flow editor dialog */}
        <FlowEditor
          open={flowEditorOpen}
          onOpenChange={setFlowEditorOpen}
          actions={button.flow}
          onChange={(actions) => onChange({ ...button, flow: actions })}
          factionId={factionId}
        />
      </DialogContent>
    </Dialog>
  );
}
