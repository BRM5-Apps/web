export default function HubOverviewPage({
  params,
}: {
  params: { hubId: string };
}) {
  return (
    <div className="page-header">
      <h1 className="page-title">Hub Overview</h1>
      <p className="page-description">Hub ID: {params.hubId}</p>
    </div>
  );
}
