"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscordCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
  size?: "sm" | "md";
}

export function DiscordCheckbox({
  checked,
  onChange,
  label,
  description,
  className,
  size = "md",
}: DiscordCheckboxProps) {
  const boxSize = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const textSize = size === "sm" ? "text-[13px]" : "text-[15px]";

  return (
    <label className={cn("group flex cursor-pointer items-center gap-3", className)}>
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={cn(
            "peer appearance-none rounded-[4px] border-2 border-[#80848E] bg-transparent transition-all checked:border-[#5865F2] checked:bg-[#5865F2]",
            boxSize,
          )}
        />
        <Check
          className={cn(
            "pointer-events-none absolute text-white opacity-0 transition-opacity peer-checked:opacity-100",
            iconSize,
          )}
          strokeWidth={3}
        />
      </div>
      {(label || description) && (
        <div>
          {label && (
            <span className={cn("font-medium text-[#DBDEE1] transition-colors group-hover:text-white", textSize)}>
              {label}
            </span>
          )}
          {description && (
            <p className="mt-0.5 text-sm text-[#B5BAC1]">{description}</p>
          )}
        </div>
      )}
    </label>
  );
}
