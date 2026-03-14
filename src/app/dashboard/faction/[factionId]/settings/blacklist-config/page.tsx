export default function BlacklistConfigPage({
  params,
}: {
  params: Promise<{ factionId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Blacklist Configuration</h1>
      <p className="page-description">Configure blacklist enforcement rules.</p>
    </div>
  );
}
