export default function EventDetailPage({
  params,
}: {
  params: { factionId: string; eventId: string };
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Event Details</h1>
      <p className="page-description">Event ID: {params.eventId}</p>
    </div>
  );
}
