export default function ServerSettingsPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Server Settings</h1>
      <p className="page-description">Configure general server settings.</p>
    </div>
  );
}
