export default function HubRanksPage({
  params,
}: {
  params: Promise<{ hubId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Hub Ranks</h1>
      <p className="page-description">Configure ranks and permissions for this hub.</p>
    </div>
  );
}
