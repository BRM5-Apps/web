export default function EventsPage({
  params,
}: {
  params: { factionId: string };
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Events</h1>
      <p className="page-description">View and manage faction events.</p>
    </div>
  );
}
