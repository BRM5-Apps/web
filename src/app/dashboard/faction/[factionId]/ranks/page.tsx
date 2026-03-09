export default function RanksPage({
  params,
}: {
  params: { factionId: string };
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Rank Management</h1>
      <p className="page-description">Configure ranks and permissions for this faction.</p>
    </div>
  );
}
