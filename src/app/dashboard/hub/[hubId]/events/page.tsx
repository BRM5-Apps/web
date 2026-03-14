export default function HubEventsPage({
  params,
}: {
  params: Promise<{ hubId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Hub Events</h1>
      <p className="page-description">View and manage hub events.</p>
    </div>
  );
}
