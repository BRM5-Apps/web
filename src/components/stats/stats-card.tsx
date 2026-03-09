interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
}

export function StatsCard({ label, value, change }: StatsCardProps) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {change && <p className="text-sm text-muted-foreground mt-1">{change}</p>}
    </div>
  );
}
