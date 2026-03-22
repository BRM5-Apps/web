export default async function HubOverviewPage({
  params,
}: {
  params: Promise<{ hubId: string }>;
}) {
  const { hubId } = await params;
  return (
    <div className="page-header">
      <h1 className="page-title">Hub Overview</h1>
      <p className="page-description">Hub ID: {hubId}</p>
    </div>
  );
}
