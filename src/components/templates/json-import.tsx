"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, Upload, Download } from "lucide-react";

export interface JsonImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (json: string) => void;
  getJson: () => string;
  title?: string;
}

export function JsonImportDialog({ open, onOpenChange, onImport, getJson, title = "Import/Export JSON" }: JsonImportDialogProps) {
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);

  function handleImport() {
    try {
      JSON.parse(value);
      onImport(value);
      toast.success("Imported JSON");
      setValue("");
    } catch (e) {
      toast.error("Invalid JSON");
    }
  }

  async function handleCopyCurrent() {
    const str = getJson();
    try {
      await navigator.clipboard.writeText(str);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
      toast.success("Copied JSON to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Paste Discord JSON or export the current builder state.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <ScrollArea className="h-64">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Paste JSON here..."
              className="min-h-[16rem] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none"
            />
          </ScrollArea>
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleImport}>
                <Upload className="mr-2 h-4 w-4" /> Import
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCopyCurrent}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} Copy current JSON
              </Button>
              <Button type="button" onClick={handleCopyCurrent}>
                <Download className="mr-2 h-4 w-4" /> Copy as API payload
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

