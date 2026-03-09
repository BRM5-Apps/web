export default function FactionOverviewPage({
  params,
}: {
  params: { factionId: string };
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Faction Overview</h1>
      <p className="page-description">Faction ID: {params.factionId}</p>
    </div>
  );
}
