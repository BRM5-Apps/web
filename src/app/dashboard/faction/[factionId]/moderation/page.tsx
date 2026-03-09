export default function ModerationPage({
  params,
}: {
  params: { factionId: string };
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Moderation</h1>
      <p className="page-description">View punishments and manage moderation actions.</p>
    </div>
  );
}
