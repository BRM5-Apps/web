export default function StatsPage({
  params,
}: {
  params: { factionId: string };
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Analytics & Stats</h1>
      <p className="page-description">View faction analytics, leaderboards, and trends.</p>
    </div>
  );
}
