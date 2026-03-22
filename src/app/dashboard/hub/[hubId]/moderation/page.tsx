export default function HubModerationPage({
  params,
}: {
  params: Promise<{ hubId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Hub Moderation</h1>
      <p className="page-description">View punishments and manage moderation actions.</p>
    </div>
  );
}
