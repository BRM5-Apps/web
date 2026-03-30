"use client";

import { useState, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Dynamic import to avoid SSR issues with emoji-mart
import dynamic from "next/dynamic";

const Picker = dynamic(
  () => import("@emoji-mart/react").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-[350px] w-[352px] bg-[#2b2d31]"><span className="text-sm text-[#b5bac1]">Loading...</span></div> },
);

interface EmojiPickerPopoverProps {
  value?: string;
  onChange: (emoji: string | undefined) => void;
  className?: string;
  size?: "sm" | "md";
}

export function EmojiPickerPopover({
  value,
  onChange,
  className,
  size = "md",
}: EmojiPickerPopoverProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (emoji: { native?: string; id?: string }) => {
      if (emoji.native) {
        onChange(emoji.native);
      }
      setOpen(false);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(undefined);
    setOpen(false);
  }, [onChange]);

  const btnSize = size === "sm" ? "h-8 w-8 text-base" : "h-10 w-10 text-xl";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Set emoji"
          className={cn(
            "flex shrink-0 items-center justify-center rounded-[3px] bg-[#1E1F22] transition-colors hover:bg-[#2B2D31] border border-transparent focus:border-[#5865F2]",
            btnSize,
            className,
          )}
        >
          {value ?? <span className="opacity-30">😀</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-[#3f4147] bg-transparent p-0 shadow-xl"
        side="bottom"
        align="start"
        sideOffset={4}
      >
        <div>
          <Picker
            data={undefined}
            onEmojiSelect={handleSelect}
            theme="dark"
            set="native"
            skinTonePosition="search"
            previewPosition="none"
            navPosition="top"
            perLine={8}
            maxFrequentRows={2}
          />
          {value && (
            <div className="border-t border-[#3f4147] bg-[#2b2d31] px-3 py-2">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Remove emoji
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
