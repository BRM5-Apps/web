"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { C2LinkButton } from "./types";

interface LinkButtonEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  btn: C2LinkButton;
  onChange: (btn: C2LinkButton) => void;
}

export function LinkButtonEditDialog({
  open,
  onOpenChange,
  btn,
  onChange,
}: LinkButtonEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-[#2b2d31] border-[#3f4147] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Link Button</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Label</Label>
            <div className="relative">
              <Input
                value={btn.label}
                maxLength={80}
                onChange={(e) => onChange({ ...btn, label: e.target.value })}
                placeholder="Link"
                className="bg-[#1e1f22] border-[#3f4147] text-white pr-14"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs italic text-gray-500 pointer-events-none">
                {btn.label.length}/80
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">URL</Label>
            <Input
              value={btn.url}
              onChange={(e) => onChange({ ...btn, url: e.target.value })}
              placeholder="https://example.com"
              className="bg-[#1e1f22] border-[#3f4147] text-white"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={btn.disabled}
              onChange={(e) => onChange({ ...btn, disabled: e.target.checked })}
              className="accent-[#5865F2]"
            />
            Disabled
          </label>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-[#5865F2] hover:bg-[#4752c4] text-white px-8"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
