import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SectionLoaderProps {
  className?: string;
}

interface TableLoaderProps {
  rows?: number;
  columns?: number;
  className?: string;
}

interface InlineLoaderProps {
  size?: "sm" | "md";
  className?: string;
}

const spinnerSize = {
  sm: "h-3.5 w-3.5 border-2",
  md: "h-4 w-4 border-2",
} as const;

function Spinner({ size = "md", className }: InlineLoaderProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block animate-spin rounded-full border-current border-r-transparent",
        spinnerSize[size],
        className
      )}
    />
  );
}

export function PageLoader() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center p-12">
      <Spinner className="h-8 w-8 border-[3px] text-primary" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function SectionLoader({ className }: SectionLoaderProps) {
  return (
    <div role="status" aria-live="polite" className={cn("rounded-lg border p-4", className)}>
      <div className="space-y-3">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-32 w-full" />
      </div>
      <span className="sr-only">Loading section</span>
    </div>
  );
}

export function TableLoader({ rows = 5, columns = 5, className }: TableLoaderProps) {
  const safeRows = Math.max(1, rows);
  const safeColumns = Math.max(1, columns);

  return (
    <div role="status" aria-live="polite" className={cn("rounded-md border", className)}>
      <div className="border-b p-4">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${safeColumns}, minmax(0, 1fr))` }}>
          {Array.from({ length: safeColumns }).map((_, index) => (
            <Skeleton key={`head-${index}`} className="h-4 w-2/3" />
          ))}
        </div>
      </div>
      <div className="space-y-0">
        {Array.from({ length: safeRows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-3 border-b p-4 last:border-b-0"
            style={{ gridTemplateColumns: `repeat(${safeColumns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: safeColumns }).map((__, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Loading table</span>
    </div>
  );
}

export function InlineLoader({ size = "md", className }: InlineLoaderProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Spinner size={size} />
      <span className="sr-only">Loading</span>
    </span>
  );
}

export const Loading = PageLoader;
