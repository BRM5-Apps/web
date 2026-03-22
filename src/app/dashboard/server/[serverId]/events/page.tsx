export default function EventsPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Events</h1>
      <p className="page-description">View and manage server events.</p>
    </div>
  );
}
