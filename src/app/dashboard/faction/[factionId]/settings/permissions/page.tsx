export default function PermissionSettingsPage({
  params,
}: {
  params: Promise<{ factionId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Permission Settings</h1>
      <p className="page-description">Configure rank-based permission assignments.</p>
    </div>
  );
}
