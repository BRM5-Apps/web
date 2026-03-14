export default function EventSettingsPage({
  params,
}: {
  params: Promise<{ factionId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Event Settings</h1>
      <p className="page-description">Configure event types, defaults, and scheduling rules.</p>
    </div>
  );
}
