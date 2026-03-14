export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ factionId: string; eventId: string }>;
}) {
  const { eventId } = await params;
  return (
    <div className="page-header">
      <h1 className="page-title">Event Details</h1>
      <p className="page-description">Event ID: {eventId}</p>
    </div>
  );
}
