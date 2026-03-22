import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DiscordButtonStyle = "primary" | "secondary" | "success" | "danger";

interface ButtonPreviewProps {
  label: string;
  style: DiscordButtonStyle;
  emoji?: ReactNode;
  disabled?: boolean;
  className?: string;
}

const styleMap: Record<DiscordButtonStyle, string> = {
  primary: "bg-[#5865F2] hover:bg-[#4752C4] text-white",
  secondary: "bg-[#4E5058] hover:bg-[#6D6F78] text-white",
  success: "bg-[#248046] hover:bg-[#1F6E3D] text-white",
  danger: "bg-[#DA373C] hover:bg-[#A12828] text-white",
};

export function ButtonPreview({ label, style, emoji, disabled = false, className }: ButtonPreviewProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex h-[32px] min-h-[32px] select-none items-center justify-center gap-2 rounded-[3px] px-[16px]",
        "font-['gg_sans','Whitney','Helvetica Neue',Helvetica,Arial,sans-serif] text-[14px] font-medium leading-[16px]",
        "transition-colors duration-150",
        styleMap[style],
        disabled && "cursor-not-allowed opacity-50 hover:bg-inherit",
        className
      )}
    >
      {emoji ? <span className="inline-flex items-center leading-none">{emoji}</span> : null}
      <span>{label}</span>
    </button>
  );
}
