import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RankInfo {
  name: string;
  color?: string;
  level?: number;
}

interface RankBadgeProps {
  rank: RankInfo;
  showLevel?: boolean;
  className?: string;
}

function withAlpha(hexColor: string, alpha: string): string {
  if (!hexColor.startsWith("#")) {
    return hexColor;
  }

  const normalized = hexColor.length === 4
    ? `#${hexColor[1]}${hexColor[1]}${hexColor[2]}${hexColor[2]}${hexColor[3]}${hexColor[3]}`
    : hexColor.slice(0, 7);

  if (normalized.length !== 7) {
    return hexColor;
  }

  return `${normalized}${alpha}`;
}

export function RankBadge({ rank, showLevel = false, className }: RankBadgeProps) {
  const color = rank.color?.trim() || "#6b7280";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn("border px-2.5 py-0.5 font-medium", className)}
            style={{
              borderColor: color,
              color,
              backgroundColor: withAlpha(color, "1A"),
            }}
          >
            {rank.name}
            {showLevel && typeof rank.level === "number" ? ` (Lv.${rank.level})` : ""}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{rank.name}</p>
          <p className="text-xs text-muted-foreground">Level {rank.level ?? "-"} | {color}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
