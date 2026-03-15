"use client";

interface StatCardProps {
  label: string;
  value?: number | string;
  isLoading?: boolean;
}

export function StatCard({ label, value, isLoading }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {isLoading ? (
        <div className="mt-2 h-7 w-16 animate-pulse rounded bg-muted" />
      ) : (
        <p className="mt-1 text-2xl font-bold text-foreground">
          {value ?? "—"}
        </p>
      )}
    </div>
  );
}
