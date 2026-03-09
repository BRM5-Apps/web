export default function HubSettingsPage({
  params,
}: {
  params: { hubId: string };
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Hub Settings</h1>
      <p className="page-description">Configure general hub settings.</p>
    </div>
  );
}
