export default function HubStatsPage({
  params,
}: {
  params: { hubId: string };
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Hub Analytics</h1>
      <p className="page-description">View hub analytics, leaderboards, and trends.</p>
    </div>
  );
}
