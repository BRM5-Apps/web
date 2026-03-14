export default function FactionSettingsPage({
  params,
}: {
  params: Promise<{ factionId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Faction Settings</h1>
      <p className="page-description">Configure general faction settings.</p>
    </div>
  );
}
