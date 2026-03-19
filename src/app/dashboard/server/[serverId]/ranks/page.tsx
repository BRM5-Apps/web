export default function RanksPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Rank Management</h1>
      <p className="page-description">Configure ranks and permissions for this server.</p>
    </div>
  );
}
