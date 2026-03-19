export default function EventRequestsPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Event Requests</h1>
      <p className="page-description">Review and approve member event requests.</p>
    </div>
  );
}
