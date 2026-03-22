import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const defaultVariantMap: Record<string, string> = {
  scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  completed: "border-slate-200 bg-slate-100 text-slate-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
  mute: "border-orange-200 bg-orange-50 text-orange-700",
  kick: "border-rose-200 bg-rose-50 text-rose-700",
  ban: "border-red-200 bg-red-50 text-red-700",
};

interface StatusBadgeProps {
  status: string;
  variantMap?: Record<string, string>;
  formatLabel?: (value: string) => string;
  className?: string;
}

function formatStatusLabel(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function StatusBadge({
  status,
  variantMap,
  formatLabel,
  className,
}: StatusBadgeProps) {
  const normalized = status.trim().toLowerCase();
  const safeStatus = normalized || "unknown";
  const styles = (variantMap ?? defaultVariantMap)[normalized] ?? "border-muted bg-muted text-muted-foreground";

  return (
    <Badge
      variant="outline"
      className={cn("capitalize font-medium", styles, className)}
    >
      {formatLabel ? formatLabel(safeStatus) : formatStatusLabel(safeStatus)}
    </Badge>
  );
}
