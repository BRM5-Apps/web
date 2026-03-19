export default function StatsPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Analytics & Stats</h1>
      <p className="page-description">View server analytics, leaderboards, and trends.</p>
    </div>
  );
}
