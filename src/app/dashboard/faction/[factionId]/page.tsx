export default async function FactionOverviewPage({
  params,
}: {
  params: Promise<{ factionId: string }>;
}) {
  const { factionId } = await params;
  return (
    <div className="page-header">
      <h1 className="page-title">Faction Overview</h1>
      <p className="page-description">Faction ID: {factionId}</p>
    </div>
  );
}
